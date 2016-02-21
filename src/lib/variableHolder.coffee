
variables =
  Map:
    empty_ratio: .3
    chance_producer_spawn: 10
    chance_roamer_spawn: 100
  ProducerEntity:
    starting_life: 200
    life_gain_per_food: 1200
    life_to_reproduce: 600
    life_loss_to_reproduce: 400
    max_life: 600
    min_life_to_transfer: 50
    max_life_transfer: 50
    eating_cooldown: 10
    age_to_reproduce: 80
    old_age_death_multiplier: 10000000

module.exports = variables
