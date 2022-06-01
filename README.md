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
![sample1_1](https://user-images.githubusercontent.com/55171652/170905464-d0396a65-2c74-4643-a450-5278d8d87940.PNG)
### Search Result:
![enchantments_order_boots1](https://user-images.githubusercontent.com/55171652/171353212-cc3e2c89-9fb2-4b2c-85c9-f28242af18a2.png)


## Mode 2 (lowest cost search)
![sample2_1](https://user-images.githubusercontent.com/55171652/170905517-d8900c06-c65d-4bf2-86b0-aeafd59d38f6.PNG)
![sample2_2](https://user-images.githubusercontent.com/55171652/171353419-b1f47967-704a-4afb-9a2f-d45c6c044e29.PNG)
### Search Result:
![enchantments_order_boots2](https://user-images.githubusercontent.com/55171652/171353259-1176fccb-17e9-4ed9-be47-08e99b68c845.png)


## Mode 2 (search to match target)
![sample3_1](https://user-images.githubusercontent.com/55171652/170905526-96a3acf3-113a-4f3e-bf07-d551c7db7139.PNG)
### Search Result:
![enchantments_order_boots3](https://user-images.githubusercontent.com/55171652/171353306-042532e2-f17b-4e6a-bb10-634aea8c1de0.png)
