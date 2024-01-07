# Minecraft-Enchantment-Order-Calculator
Calculate the most optimal enchantment order in Minecraft (in anvil).

This program uses precomputed binary trees to optimize the fast searching.
It searches from the optimal sets to get the best result.


Calculator: https://kkchengaf.github.io/Minecraft-Enchantment-Order-Calculator/

There are 2 modes available:
- 1 tool + multiple enchantment books (fast)
- multiple tools and books (brute force):
  - can specify the target

Supported Features:
- Items with prior work penalty
  - Prior work penalty = cost to to rename the item - 1 (just put in anvil to check the cost, no need really to rename it)
- Save result as image 
- Reload the result (drag and drop the image into the page)
- God Armor (where protection enchantments are not mutually exclusive from MC 1.14 to 1.14.2)


## Mode 1 (fast search)
![input_boots1](https://user-images.githubusercontent.com/55171652/171546996-b56b6cbb-7823-4d75-9acf-46ba0c949a2b.PNG)

### Search Result:
![enchantments_order_boots1](https://user-images.githubusercontent.com/55171652/171384057-4b974142-e1b3-4e10-aa76-fa217a24e492.png)



## Mode 2 (brute force)
![input_boots2](https://user-images.githubusercontent.com/55171652/171547008-ef0c2ee9-9a3a-45ae-bb86-5868acc92515.png)

### Search Result: (same boots in mode 1)
![enchantments_order_boots2](https://user-images.githubusercontent.com/55171652/171384070-50b21551-9f24-4130-8702-e60ffe5137d8.png)




## Mode 2 (search to match target)
![input_boots3](https://user-images.githubusercontent.com/55171652/171547016-f7db6396-3acb-40d4-a75e-7dad835d38f4.png)

### Search Result:
![enchantments_order_boots3](https://user-images.githubusercontent.com/55171652/171384086-8d1c31ab-0ab4-4c32-9f24-ba22abdee885.png)


---
<details>
  <summary> Optimization Details for fast search (credit if it help!) </summary>
  
  ## Background
  1. The whole process of combining books to an item can be viewed as a full binary tree: 
     * the root is the final output
     * the leaves are the inputs
     * the intermediate nodes are the intermediate outputs from anvil
     * each node stores 3 values:
       * enchantment cost: the sum of cost multiplier of the enchantments of this item
       * anvil cost: the prior work penalty of this item
       * total cost: the cost to combine this item
  
  2. For each intermediate node, we "combine" the right child to the left child, the same as combining in anvil. 
  3. **The order of child nodes matters because the combining mechanism ignores the enchantment cost of the left child.**
     * In other words, **only the enchantment cost in right child** will be used to calculate the cost. (VERY IMPORTANT)
  4. The anvil cost of intermediate node, is the distance to the deepest descendant. For Leaves, the cost is zero. 
     * Anvil cost can be computed without knowing the inputs enchants. **Anvil cost is associated to the tree structure**.
  
  ## Problem
  * Given a set of leaf nodes, our goal is to construct an optimal binary tree, so that the whole process results in lowest total cost in root.
  * As we do a post order traversal through the tree, we can get the cost of combining in each step (each combine in anvil).
  
  ## Intuitive Approach
  * The most straight forward approach is to build all the trees, then permutate all the inputs mapped to the leaves. But this will take a very long time.
    * For instance, lets assume we have a boot and 7 books. 
    * There are 429 distinct full trees in total, and for each tree, there are 7! permutations. 
    * This results in **2.16 million combinations**. It would be better to remove some of the trees from the computation. 
  
  ## Optimization
  1. For every intermediate node, we know that only the right child's enchantment will be used to calculate the intermediate combining cost. 
     * **For each input item on the right, it contributes its enchantment cost to its intermediate output.**
     * **For all intermediate outputs on the right, it contributes its enchantment cost to its next intermediate output/final output.**
     * This means, if we arrange the items with less enchantment cost to right and the one with higher cost to left, the total enchantment cost will be lower. 
     * The reason is that the **lower cost item occupy the leaves with the most number of "contribution", while the higher cost item occupy the leaves with least number of "contribution"**.

  2. Next step, we can calculate the amount of contributions of the leaves for all the trees, and filter out some of the trees. 
     * The filter is simple. We only want those trees with minimal "contribution" of all leaves. This makes the nodes lie on the left side.
     * Note that we also need to consider the anvil cost. Different tree structures yields different anvil costs, we keep all optimal trees for all different anvil costs.
     * This steps reduces great amount of trees. For trees with 8 leaf nodes, there are only 22 trees remains (with 8 distinct anvil costs). 

  3. Now we have a list of contributions for all trees, we need to match the enchantment costs (inputs') to the "contributions" (leaves). 
**We want to match the high enchantment cost to less contributions, and low cost to more contributions.** 
     * We can get the total cost of enchantment instantly after **sorting on both lists**. multiply each item on both sorted lists and its done.
     * After the optimization, we only need to consider **22 combinations**, and the sorting of 8 inputs' enchantment costs! 
</details>

---
