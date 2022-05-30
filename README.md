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
![sample1_2](https://user-images.githubusercontent.com/55171652/170905507-8201c3fe-2885-4f58-a9f1-e706ce93b24c.PNG)

## Mode 2 (lowest cost search)
![sample2_1](https://user-images.githubusercontent.com/55171652/170905517-d8900c06-c65d-4bf2-86b0-aeafd59d38f6.PNG)
![sample2_2](https://user-images.githubusercontent.com/55171652/170905520-b8c8cbae-f00b-4a14-9276-7c923d9d128f.PNG)
![sample2_3](https://user-images.githubusercontent.com/55171652/170905523-e4919990-757f-4f06-a40a-934d27279e43.PNG)

## Mode 3 (search to match target)
![sample3_1](https://user-images.githubusercontent.com/55171652/170905526-96a3acf3-113a-4f3e-bf07-d551c7db7139.PNG)
![sample3_2](https://user-images.githubusercontent.com/55171652/170905528-065f7358-beac-40db-97f8-de425bbef11d.PNG)
