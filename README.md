# Minecraft-Enchantment-Order-Calculator
Calculate the most optimal enchantment order in Minecraft (in anvil).

This program uses precomputed binary trees and greedy search to optimize the performance.
It searches from the optimal sets to get the best result.

There are 2 modes available in this calculator:
- combine single enchantment books into tool (fast):
- combine enchanted books and tools together (advance):
  - you can also specify the output enchantment

Supported Features:
- Items previously combined from anvil (with prior work penalty)
  - Prior work penalty = cost to to rename the item - 1 (just put in anvil to check the cost, no need really to rename it)
- Save result as image 
- Reload result from image (You can drop the generated search result below into the page)
- God Armor search (where protection enchantments are not mutually exclusive from MC 1.14 to 1.14.2)


Calculator: https://kkchengaf.github.io/Minecraft-Enchantment-Order-Calculator/

## Mode 1 (single enchantment search)
![input_boots1_1](https://user-images.githubusercontent.com/55171652/171380488-35a8d4be-4e35-4a67-82d4-9bb149bd8409.PNG)
### Search Result:
![enchantments_order_boots1](https://user-images.githubusercontent.com/55171652/171353212-cc3e2c89-9fb2-4b2c-85c9-f28242af18a2.png)


## Mode 2 (lowest cost search)
![input_boots2_1](https://user-images.githubusercontent.com/55171652/171380530-5b2c4e93-8e56-472e-9550-42358c50e9bf.PNG)
![input_boots2_2](https://user-images.githubusercontent.com/55171652/171380537-070b3255-ff02-4775-a8b9-2de43c65dcdb.PNG)
### Search Result: (same boots in mode 1)
![enchantments_order_boots2](https://user-images.githubusercontent.com/55171652/171380873-c674c631-cd6b-4d57-85dc-ecf3747af628.png)



## Mode 2 (search to match target)
![input_boots3](https://user-images.githubusercontent.com/55171652/171380606-0204bf53-50a3-4cb6-a2fa-4b3e4280ffda.PNG)
### Search Result:
![enchantments_order_boots3](https://user-images.githubusercontent.com/55171652/171353306-042532e2-f17b-4e6a-bb10-634aea8c1de0.png)
