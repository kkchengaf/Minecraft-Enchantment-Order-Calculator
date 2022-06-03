# Minecraft-Enchantment-Order-Calculator
Calculate the most optimal enchantment order in Minecraft (in anvil).

This program uses precomputed binary trees and greedy search to optimize the performance.
It searches from the optimal sets to get the best result.

There are 2 types of search available in this calculator:
- combine single enchantment books (from villagers) into item (fast):
- combine enchanted books and tools together into single item (advance):
  - optioanlly, you can also specify the output enchantment

Supported Features:
- Items previously combined from anvil (with prior work penalty)
  - Prior work penalty = cost to to rename the item - 1 (just put in anvil to check the cost, no need really to rename it)
- Save result as image 
- Reload result from image (You can drop the generated search result below into the page)
- God Armor search (where protection enchantments are not mutually exclusive from MC 1.14 to 1.14.2)


Calculator: https://kkchengaf.github.io/Minecraft-Enchantment-Order-Calculator/

## Mode 1 (single enchantment search)
![input_boots1](https://user-images.githubusercontent.com/55171652/171546996-b56b6cbb-7823-4d75-9acf-46ba0c949a2b.PNG)

### Search Result:
![enchantments_order_boots1](https://user-images.githubusercontent.com/55171652/171384057-4b974142-e1b3-4e10-aa76-fa217a24e492.png)



## Mode 2 (lowest cost search)
![input_boots2](https://user-images.githubusercontent.com/55171652/171547008-ef0c2ee9-9a3a-45ae-bb86-5868acc92515.png)

### Search Result: (same boots in mode 1)
![enchantments_order_boots2](https://user-images.githubusercontent.com/55171652/171384070-50b21551-9f24-4130-8702-e60ffe5137d8.png)




## Mode 2 (search to match target)
![input_boots3](https://user-images.githubusercontent.com/55171652/171547016-f7db6396-3acb-40d4-a75e-7dad835d38f4.png)

### Search Result:
![enchantments_order_boots3](https://user-images.githubusercontent.com/55171652/171384086-8d1c31ab-0ab4-4c32-9f24-ba22abdee885.png)

