const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));

function calculator() {
    const messages = [];
    let onRequest;
    const context = vm.createContext({
        console: { log() {} },
        self: { addEventListener(type, callback) { onRequest = callback; } },
        postMessage(message) { messages.push(message); },
        close() {},
    });
    vm.runInContext(read('search.js'), context);
    const source = read('parse.js');
    // Load the production data builder and weight functions without starting the DOM UI.
    vm.runInContext(source.slice(0, source.indexOf('document.getElementById("datalist-area")')), context);
    vm.runInContext(source.slice(source.indexOf('function computeSingleBookWeight('),
        source.indexOf('function handleSearchResult(')), context);
    const Tree = vm.runInContext('Tree', context);
    Tree.setAdvn(context.advn);
    return { context, Tree, messages, onRequest };
}

const exclusiveEnchantments = [
    ['spear', 'lunge', 3, 2, 1],
    ['mace', 'density', 5, 2, 1],
    ['mace', 'breach', 4, 4, 2],
    ['mace', 'wind_burst', 3, 4, 2],
];

test('editable data and embedded browser data stay in sync', () => {
    const { context } = calculator();
    assert.deepEqual(plain(context.simplified), JSON.parse(read('simplifiedstring.json')));
    const { raw, enchantbytool, conflicts } = context.simplified;
    const ids = raw.map(row => String(row[0]));
    assert.equal(new Set(ids).size, ids.length);
    assert.deepEqual([...enchantbytool.enchanted_book].sort(), [...ids].sort());
    for (const toolIds of Object.values(enchantbytool)) {
        assert.equal(new Set(toolIds).size, toolIds.length);
        for (const id of toolIds) assert.ok(ids.includes(id));
    }
    for (const [id, others] of Object.entries(conflicts)) {
        for (const other of others) assert.ok(conflicts[other].includes(Number(id)));
    }
});

test('spears and maces expose exactly their applicable enchantments', () => {
    const { context } = calculator();
    const names = tool => Array.from(context.enchantbytool[tool], id => context.parser[id]).sort();
    assert.deepEqual(names('spear'), [
        'sharpness', 'smite', 'bane_of_arthropods', 'knockback', 'fire_aspect',
        'looting', 'unbreaking', 'mending', 'curse_of_vanishing', 'lunge',
    ].sort());
    assert.deepEqual(names('mace'), [
        'smite', 'bane_of_arthropods', 'fire_aspect', 'unbreaking', 'mending',
        'curse_of_vanishing', 'density', 'breach', 'wind_burst',
    ].sort());
    assert.ok(context.toolsname.includes('spear'));
    assert.ok(context.toolsname.includes('mace'));
});

for (const [weapon, name, maxLevel, itemMultiplier, bookMultiplier] of exclusiveEnchantments) {
    test(`${name}: book/item costs, maximum level, and weapon restrictions`, () => {
        const { context, Tree } = calculator();
        const id = context.parser[name];
        const tree = new Tree([0, 1]);
        assert.equal(context.max_lv[id], maxLevel);
        assert.equal(context.computeSingleBookWeight(id, maxLevel), maxLevel * bookMultiplier);
        assert.equal(tree.enchant_rules({ item: weapon }, { [id]: maxLevel }).cost,
            maxLevel * bookMultiplier);
        assert.equal(tree.enchant_rules({ item: weapon }, { item: weapon, [id]: maxLevel }).cost,
            maxLevel * itemMultiplier);
        assert.equal(tree.enchant_rules({ [id]: maxLevel - 1 }, { [id]: maxLevel - 1 }).enchant[id], maxLevel);
        assert.equal(tree.enchant_rules({ [id]: maxLevel }, { [id]: maxLevel }).enchant[id], maxLevel);
        for (const tool of Object.keys(context.enchantbytool)) {
            if (tool === weapon || tool === 'enchanted_book') continue;
            assert.equal(tree.enchant_rules({ item: tool }, { [id]: maxLevel }).enchant[id], undefined);
        }
    });
}

test('Lunge and Mending combine in either order', () => {
    const { context, Tree } = calculator();
    const lunge = context.parser.lunge;
    const mending = context.parser.mending;
    const tree = new Tree([0, 1]);
    for (const [left, right] of [[lunge, mending], [mending, lunge]]) {
        const result = tree.enchant_rules({ item: 'spear', [left]: context.max_lv[left] },
            { [right]: context.max_lv[right] });
        assert.equal(result.enchant[lunge], 3);
        assert.equal(result.enchant[mending], 1);
    }
});

test('weapon damage enchantments remain mutually exclusive, including with God Armor enabled', () => {
    const { context, Tree } = calculator();
    for (const [weapon, names] of [
        ['spear', ['sharpness', 'smite', 'bane_of_arthropods']],
        ['mace', ['density', 'breach', 'smite', 'bane_of_arthropods']],
    ]) {
        for (const godArmor of [false, true]) {
            const tree = new Tree([0, 1]);
            tree.set_god_armor(godArmor);
            for (const left of names) {
                for (const right of names) {
                    if (left === right) continue;
                    const a = context.parser[left];
                    const b = context.parser[right];
                    const result = tree.enchant_rules({ item: weapon, [a]: context.max_lv[a] },
                        { [b]: context.max_lv[b] });
                    assert.equal(result.enchant[a], context.max_lv[a]);
                    assert.equal(result.enchant[b], undefined);
                    assert.equal(result.cost, 1);
                }
            }
        }
    }
});

for (const [weapon, names] of [
    ['spear', ['sharpness', 'lunge', 'mending']],
    ['mace', ['density', 'wind_burst', 'mending']],
    ['mace', ['breach', 'wind_burst', 'mending']],
]) {
    test(`${weapon} ${names[0]}: fast and worker searches agree and produce the requested result`, () => {
        const { context, Tree, messages, onRequest } = calculator();
        const goal = Object.fromEntries(names.map(name => {
            const id = context.parser[name];
            return [id, context.max_lv[id]];
        }));
        const inputs = [{ item: weapon }, ...Object.entries(goal).map(([id, level]) => ({ [id]: level }))];
        const weights = inputs.map(item => context.computeWeight(item).reduce((a, b) => a + b, 0));
        const fast = context.search(weights);
        onRequest({ data: { type: 'request', data: [weights,
            { ...inputs, goal, prior: 0 }, false, context.advn] } });
        const advanced = messages.find(message => message.type === 'result').data;
        assert.equal(fast.enchant_cost + fast.anvil_cost, advanced.enchant_cost + advanced.anvil_cost);
        assert.ok(advanced.enchant_cost + advanced.anvil_cost < 10000);
        const tree = new Tree(advanced.strc);
        tree.set_goal(goal);
        tree.get_sum(advanced.wrt);
        assert.equal(tree.invalidflag, false);
        assert.deepEqual(plain(tree.root.value.enchant), { item: weapon, ...goal });
    });
}

test('all compatible spear enchantments fit the fast search table', () => {
    const { context } = calculator();
    const goal = Object.fromEntries(['sharpness', 'knockback', 'fire_aspect', 'looting',
        'unbreaking', 'mending', 'curse_of_vanishing', 'lunge'].map(name => {
        const id = context.parser[name];
        return [id, context.max_lv[id]];
    }));
    const result = context.search([0, ...context.computeWeight(goal)]);
    assert.equal(result.wrt.length, 9);
    assert.ok(Number.isFinite(result.enchant_cost + result.anvil_cost));
    assert.ok(result.enchant_cost + result.anvil_cost < 10000);
});

test('spear upgrades include prior work penalties', () => {
    const { context, Tree } = calculator();
    const lunge = context.parser.lunge;
    const mending = context.parser.mending;
    const inputs = [{ item: 'spear', [lunge]: 2, prior: 3 }, { [lunge]: 2 }, { [mending]: 1 }];
    const goal = { [lunge]: 3, [mending]: 1 };
    // Apply Lunge II to the previously worked spear, then Mending:
    // (3 enchantment + 3 prior) + (2 enchantment + 7 prior) = 15 levels.
    const tree = new Tree([[0, 1], 2]);
    tree.set_goal(goal);
    tree.get_sum(inputs.map(enchant => ({ cost: 0, enchant })));
    assert.equal(tree.sum, 5);
    assert.equal(tree.priorpenalty, 10);
    assert.equal(tree.invalidflag, false);
    assert.equal(tree.root.value.enchant.item, 'spear');
    assert.equal(tree.root.value.enchant[lunge], 3);
    assert.equal(tree.root.value.enchant[mending], 1);
});
