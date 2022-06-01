# Minecraft-Enchantment-Order-Calculator
Calculate the most optimal enchantment order in Minecraft (in anvil).

This program uses precomputed binary trees and greedy search to optimize the performance.
It searches from at most 26 optimal sets to get the best result.

This calculator works in 3 ways:
- if only output target is set:
  - it assumes combining books with single enchantment
- if only inputs are set:
  - it searches the lowest cost order to combine ALL inputs
- if both inputs and output are set:
  - it searches in addition to matching the output enchantment

Calculator: https://kkchengaf.github.io/Minecraft-Enchantment-Order-Calculator/

## Mode 1 (single enchantment search)
![sample1_1](https://user-images.githubusercontent.com/55171652/170905464-d0396a65-2c74-4643-a450-5278d8d87940.PNG)
![enchantments_order_boots1](https://user-images.githubusercontent.com/55171652/171353212-cc3e2c89-9fb2-4b2c-85c9-f28242af18a2.png)


## Mode 2 (lowest cost search)
![sample2_1](https://user-images.githubusercontent.com/55171652/170905517-d8900c06-c65d-4bf2-86b0-aeafd59d38f6.PNG)
![sample2_2](https://user-images.githubusercontent.com/55171652/171353419-b1f47967-704a-4afb-9a2f-d45c6c044e29.PNG)
![enchantments_order_boots2](https://user-images.githubusercontent.com/55171652/171353259-1176fccb-17e9-4ed9-be47-08e99b68c845.png)


## Mode 3 (search to match target)
![sample3_1](https://user-images.githubusercontent.com/55171652/170905526-96a3acf3-113a-4f3e-bf07-d551c7db7139.PNG)
![enchantments_order_boots3](https://user-images.githubusercontent.com/55171652/171353306-042532e2-f17b-4e6a-bb10-634aea8c1de0.png)
