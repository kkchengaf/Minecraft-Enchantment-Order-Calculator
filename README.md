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
