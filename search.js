var dict, andt, advn, isJava, isInProtectionTier, isBowInfinityTier, anvil_cost_idxer, conflicts, enchantbytool;

function sort_sum(lst, base){
    let dist = base.length - lst.length
    return lst.reduce((acc, cur,idx) => acc + cur * base[idx + dist], 0)
}

class Stack {
    constructor() {
        this.lst = []
    }

    push(item) {
        this.lst.push(item)
    }

    pop() {
        return this.lst.splice(-1, 1)[0]
    }

    isEmpty() {
        return this.lst.length===0
    }
}


class Node {
    constructor(left, right, value) {
        this.left = left
        this.right = right
        this.value = value
    }
}

class Tree {
    constructor(strc) {
        this.parse_structure(strc)
    }

    serialize() {
        return JSON.parse(JSON.stringify(this))
    }

    recursive(strc) {
        if(Array.isArray(strc)) {
            if(strc.length===2) {
                let l = strc[0]
                let r = strc[1]
                return new Node(this.recursive(l), this.recursive(r))
            } else if (strc.length===1) {
                return new Node(null,null,strc[0])
            }
        } else if (typeof strc === "number") {
            return new Node(null,null,strc)
        }
        return null
    }

    parse_structure(strc) {
        this.root = this.recursive(strc)
    }

    //discard the result if any level lower than goal
    //without the item key
    set_goal(enchantdct) {
        this.goal = enchantdct
    }

    //remove mutual exclusive for protection tier if true
    set_god_armor(state) {
        this.godarmor = state
    }

    //plst: [{"cost":#, "enchant":{id:lv, "item":itemname, "prior": priorworkvalue}}]
    //sum => (enchant) cost
    //priorpenalty => anvil cost of prior work penalty
    tree_sum(plst){
        this.plst = plst
        this.sum = 0
        this.priorpenalty = 0
        this.idx = 0
        this.invalidflag = false
        this.traversal_sum(this.root)
        if(!this.invalidflag && this.goal!==undefined && this.goal!==null) {
            for(let eid of Object.keys(this.goal)) {
                if(this.goal[eid] > (this.root.value["enchant"][eid] || 0)) {
                    this.invalidflag = true
                }
            }
        }
        return this.sum + (this.invalidflag?100000:0)
    }

    //node.value: {"enchant":{}, "cost":#, "height":#, "prior":# (absent for leaves)}
    //if node value contains "prior" => convert to "height"
    //do: accumalate the sum, update the value
    //return the node value (packed) of current node
    traversal_sum(node) {
        if(this.invalidflag)
            return {}
        if(node===undefined || node===null) {
            return {"cost":-1, "height":-1}
        }
        let l = this.traversal_sum(node.left)
        let r = this.traversal_sum(node.right)
        if(Object.keys(l["enchant"] || {}).indexOf("item")===-1 &&
            Object.keys(r["enchant"] || {}).indexOf("item")!==-1) {
            this.invalidflag = true;
            return {}
        }
        if(this.invalidflag)
            return {}
        node.value = this.pack_node(l, r)
        return node.value
    }

    /*
    this function does:
    -accumlate the enchantment cost for combining l and r
    -update to new enchantment list
    -maintain the structure, if this is leave node
    -set the node height (for prior work penalty)
    -return packed value to current node

    this.idx
    this.sum
    */
    pack_node(l,r) {
        let res = {}
        let item = {}
        res["height"] = Math.max(l["height"], r["height"]) + 1
        if(l["cost"]===-1 || r["cost"]===-1) {
            item = this.plst[this.idx]
            if(Object.keys(item["enchant"]).indexOf("prior")!==-1) {
                res["height"] = anvil_cost_idxer.indexOf(item["enchant"]["prior"])
                res["prior"] = 0
            }
            this.idx += 1
        } else {
            item = this.enchant_rules(l["enchant"], r["enchant"])
            res["prior"] = anvil_cost_idxer[parseInt(l["height"])] + anvil_cost_idxer[parseInt(r["height"])]
            this.priorpenalty += res["prior"]
        }
        res["cost"] = item["cost"]
        res["enchant"] = item["enchant"] || {}
        return res
    }

    /*
    Rules for minecraft anvil combining:
    For each enchantment on r:
    -ignore not appliable enchantment (if l is an item)
    -add incompatible enchantment penalty (Java)
    -add enchantment cost if compatible:
        equal level: increase by 1, cap by limit
        unequal level: upgrade, or keep
        conflict: keep target enchantment, (add penalty in java)
        -Java: cost determined by final level (as long as r has the enchantment)
        -Bedrock: cost determined by difference from final level and target initial

    */
    enchant_rules(l, r) {
        let enchant_cost = 0
        let res_enchant = {}
        let lv_fun = (a,b) => (isJava?Math.max(a,b):Math.abs(b-a))
        let impbed = (eid) => (eid===29&&!isJava?0.5:1)

        //when left is item
        //ignore not appliable enchantment
        if(Object.keys(l).indexOf("item")!==-1 &&
            Object.keys(enchantbytool).indexOf(l["item"]) !== -1) {
            let valid_eid = enchantbytool[l["item"]]
            r = Object.keys(r).filter(key => valid_eid.indexOf(key)!==-1 || key === "item")
                  .reduce((acc, key) => {
                      return Object.assign(acc, {[key]:r[key]})
                }, {})
        }

        //different multiplier based on r is item or book
        let multiple_from = advn["enchant_cost"]["book"]
        if(Object.keys(r).indexOf("item")!==-1) {
            multiple_from = advn["enchant_cost"]["item"]
        }
        let max_eid_lv = advn["max_lv"]

        //uncommon enchantment
        Object.keys(l).filter(eid => Object.keys(r).indexOf(eid)===-1).forEach(eid => {
            res_enchant[eid] = l[eid]
        })

        //common enchantment
        Object.keys(r).filter(key => key !== "item" && key !== "prior").forEach(eid => {
            let conflicted = (conflicts[eid] ||[]).filter(ele =>
                            Object.keys(l).indexOf(parseInt(ele))!==-1 ||
                            Object.keys(l).indexOf(Number(ele).toString())!==-1  )
            if(conflicted.length > 0 && (this.godarmor !== true || (!isInProtectionTier(eid) && !isBowInfinityTier(eid) ))) {
                enchant_cost += (isJava?1:0)
            } else if((l[eid]||0) === r[eid]) {
                let initial_lv = l[eid]||0
                let final_lv = Math.min(max_eid_lv[eid], initial_lv+1)
                enchant_cost += 1 * lv_fun(initial_lv, final_lv) * multiple_from[eid] * impbed(eid)
                res_enchant[eid] = final_lv
            } else {
                let initial_lv = l[eid]||0
                let final_lv = Math.max(initial_lv, r[eid])
                enchant_cost += 1 * lv_fun(initial_lv, final_lv) * multiple_from[eid] * impbed(eid)
                res_enchant[eid] = final_lv
            }
        })

        if(Object.keys(l).indexOf("item")!==-1) {
            res_enchant["item"] = l["item"]
        }
        this.sum += enchant_cost
        return {"cost":enchant_cost, "enchant":res_enchant}
    }
}







function permutate(plist, li, ri, tree) {
    let cur_packed = {"cost":10000, "min_lst":[], "prior": 10000}
    if(li===ri) {
        let new_min = tree.tree_sum(plist)
        return {"cost": new_min, "min_lst":plist.slice(0), "prior":tree.priorpenalty}
    } else {
        for(let idx=li;idx<=ri;idx++) {
            plist[li] = plist.splice(idx, 1, plist[li])[0]
            if(Object.keys(plist[0]["enchant"]).indexOf("item")!==-1) {
                packed = permutate(plist, li+1, ri, tree);
                if(cur_packed["cost"]+cur_packed["prior"] > packed["cost"]+packed["prior"]) {
                    cur_packed = packed
                }
            }
            plist[li] = plist.splice(idx, 1, plist[li])[0]
        }
    }
    return cur_packed
}

/*
find the permute in given tree with min cost
plst: [{"cost":#, "enchant":{id:lv}}]
strc: []
condition: arrdict["goal"]:{id:lv} the goal enchantment to do (optional)
condition: arrdict["prior"]:1 , exist at least 1 item with prior work penalty
return: {"strc":[], "min_lst":[], "cost":#, "prior":#}
*/
function tree_sum(lst, arrdict, strc, godarmor) {
    let tree = new Tree(strc)
    let arr = lst.map((ele,idx) =>  {
        return {"cost":ele, "enchant":arrdict[idx]}
    })
    if(arrdict["goal"]!==undefined) {
        tree.set_goal(arrdict["goal"])
    }
    if(godarmor!==undefined) {
        tree.set_god_armor(godarmor)
    }
    let cur_min = 100000
    let min_lst = []

    return Object.assign({"strc":strc}, permutate(arr, 0, arr.length-1, tree))
}


function argsort(arr, reverse) {
    if(reverse===true) {
        return Array.from(Array(arr.length).keys()).sort((a,b) => arr[b] - arr[a])
    }
    else {
        return Array.from(Array(arr.length).keys()).sort((a,b) => arr[a] - arr[b])
    }
}

function wrt_sort(lsto, refo) {
    let flag = false
    let sliceidx = 0
    if(lsto[0]==0) {
        sliceidx = 1
        flag = true
    }
    lst = lsto.slice(sliceidx)
    ref = refo.slice(sliceidx)

    let slst = argsort(lst)
    let sref = argsort(ref, reverse=true)

    let res = new Array(lst.length).fill(0)
    lst.forEach((cur, idx) => {
        posto = sref[idx]
        posfr = slst[idx]
        res[posto] = lst[posfr]
    })

    if(flag) {
        res.splice(0, 0, 0)
    }
    return res
}


function show_progress(cur, total, cases) {
    let prog_message = "Searching: " + (cur) + " / " + total + " ("+cases+" trees)"
    console.log(prog_message);
    postMessage({"type":"message","data":prog_message})
}



function search(arr, arrdict, godarmor) {
     n = arr.length
     n_max = 10
     anvil_dict = dict[Number(n).toString()]
     advanceSearch = true
     godarmor = (godarmor===true)
     if(arrdict===undefined || typeof arrdict !== "object") {
        advanceSearch = false
     }
     if(advanceSearch && arrdict["prior"] > 0) {
        anvil_dict = andt[Number(n).toString()]
        n_max = 8
     }
     if(n>2 && n<=n_max) {
          sum_arr = arr.slice(0)
          if(!advanceSearch) {
              sum_arr = (arr[0]===0?arr.slice(1):arr.slice(0))
              sum_arr.sort((a,b) => b-a)
          }
          min_arr = []
          Object.keys(anvil_dict).forEach((cost, progidx) => {
              tarr = anvil_dict[cost]
              min_costs = []
              if(advanceSearch) {
                  show_progress((progidx+1), Object.keys(anvil_dict).length, anvil_dict[cost].length)
                  min_costs = tarr.map(cur => tree_sum(sum_arr, arrdict, cur["strc"]), godarmor)
                  min_cost = min_costs.reduce((acc, cur) => Math.min(acc, cur["cost"] + cur["prior"]), 20000)
                  mtarr = min_costs.filter((cur) => cur["cost"] + cur["prior"]===min_cost)
                  min_arr.push({"item":mtarr[0], "anvil_cost":mtarr[0]["prior"],
                                "enchant_cost":mtarr[0]["cost"]})
              } else {
                  min_costs = tarr.map(cur => sort_sum(sum_arr, cur["sort"]))
                  min_cost = min_costs.reduce((acc, cur) => Math.min(acc, cur), 10000)
                  mtarr = tarr.filter((cur,idx) => min_costs[idx]===min_cost)
                  min_arr.push({"item":mtarr[0], "anvil_cost":parseInt(cost),
                                "enchant_cost":min_cost})
              }
          })
          min_all = min_arr.reduce((acc, cur) =>
                    Math.min(acc, cur["anvil_cost"]+cur["enchant_cost"]), 10000)
          if(min_all===10000) {
              return {"wrt":[],"strc":[], "anvil_cost":10000, "enchant_cost":10000}
          }
          res = min_arr.filter(cur => cur["anvil_cost"]+cur["enchant_cost"]===min_all)[0]
          wrt_arr = []
          if(advanceSearch) {
              wrt_arr = res["item"]["min_lst"]
          } else {
              wrt_arr = wrt_sort(arr, res["item"]["flat"])
          }
          strc = new Tree(res["item"]["strc"])
          strc.tree_sum(wrt_arr)
          return {"wrt":wrt_arr, "strc":strc.serialize(),
                    "anvil_cost":res["anvil_cost"],"enchant_cost":res["enchant_cost"]}
     }
}

self.addEventListener("message", e => {
    if(e.data) {
        console.log(e.data);
        switch (e.data.type) {
            case "context":
                let protectionTier, bowInfinityTier
                [dict, andt, advn, isJava, protectionTier, bowInfinityTier, anvil_cost_idxer] = e.data.data
                conflicts = advn["conflicts"]
                enchantbytool = advn["enchantbytool"]
                isInProtectionTier = (eid) => {
                    return protectionTier.indexOf(parseInt(eid))!==-1
                }
                isBowInfinityTier = (eid) => {
                    return bowInfinityTier.indexOf(parseInt(eid))!==-1
                }
                break
            case "input":
                let [arr, arrdict, godarmor] = e.data.data
                //console.log(arr, arrdict, godarmor);
                postMessage({"type":"result","data":search(arr, arrdict, godarmor)})
                close()
                break
        }
    }
})
