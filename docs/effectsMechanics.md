# Stat Modifiers

attack_up / defense_up: These are self-buffs that increase the user's stats for the remainder of the battle (or until they switch out). The value typically corresponds to "stages." For example, a value: 1 might be a 50% boost to the stat, while a value: 2 would be a 100% boost.

enemy_attack_down / enemy_defense_down: These are debuffs applied to the opponent, lowering their respective stats by a number of stages, making them weaker or more vulnerable.

self_defense_down: This is a negative side-effect for a powerful move. After using the move, the user's own defense is lowered, making them more susceptible to counter-attacks.

accuracy_up: This increases the user's accuracy, making their subsequent attacks more likely to hit the opponent.

# Damage Calculation Effects

defense_ignore: This allows an attack to bypass a certain percentage of the opponent's defense stat when calculating damage. For example, value: 0.25 means the attack ignores 25% of the target's defense, making it very effective against tanky characters.

highCritChance: This gives the move a higher-than-normal probability of landing a "critical hit," which typically deals 1.5x or 2x the standard damage.

# Status Conditions & Unique Effects

heal: A recovery move. The value is the amount of HP restored to the user. For Sailor Moon's Moon Healing Escalation, this is a flat 50 HP.

invulnerable: A powerful defensive effect. The turns: 1 on Gojo's Limitless means that for the turn it is used, he cannot be damaged by any incoming attacks.

paralyze: This inflicts a status condition on the opponent. A paralyzed character usually has a chance (e.g., 25%) of being unable to move each turn. The chance: 0.3 on Killua's Thunderbolt means there is a 30% chance the move will inflict paralysis upon hitting.

freeze: A more severe status condition. A frozen character is unable to move at all. The condition might last for a random number of turns or until they are hit by a specific type of move.

# Move Properties (Costs & Trade-offs)

recoilDamage: After the move hits, the user takes a fixed amount of damage themselves. This is a trade-off for very high power, as seen in moves like Kanao's Vermilion Eye.

hpCost: The user must sacrifice a portion of their own HP simply to execute the move, regardless of whether it hits.

chargeTurns: The move requires one turn to prepare, during which the user can't do anything else. The attack is then unleashed on the following turn.

hits: The move strikes the opponent multiple times in a single turn. Luffy's Gum-Gum Gatling hits 3 times, with each hit having a power of 25.
