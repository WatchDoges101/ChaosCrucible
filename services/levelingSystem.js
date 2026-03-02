// Player Leveling and Skill Tree System
// Handles XP, leveling, tokens, and ability unlocks

const LEVEL_XP = [0, 100, 250, 500, 900, 1500, 2300, 3300, 4500, 6000]; // XP required for each level

const skillTrees = {
  Male: {
    blade_mastery: {
      name: 'Blade Mastery',
      description: 'Damage and precision for high-tempo melee play.',
      cost: 1,
      unlocked: false,
      children: {
        sharpened_edge: { name: 'Sharpened Edge', description: '+15% melee damage.', cost: 1, unlocked: false, children: {} },
        combo_flow: { name: 'Combo Flow', description: 'Consecutive hits increase attack speed.', cost: 1, unlocked: false, children: {} },
        perfect_strike: { name: 'Perfect Strike', description: 'Critical hits deal +50% damage.', cost: 2, unlocked: false, children: {} },
        arc_slash: { name: 'Arc Slash', description: 'Melee attacks release a short shockwave.', cost: 2, unlocked: false, children: {} },
        executioners_rhythm: { name: 'Executioner\'s Rhythm', description: 'Kills reset dash cooldown.', cost: 3, unlocked: false, children: {} }
      }
    },
    guardians_resolve: {
      name: 'Guardian\'s Resolve',
      description: 'Defense and counterplay under pressure.',
      cost: 1,
      unlocked: false,
      children: {
        iron_guard: { name: 'Iron Guard', description: '+20% damage reduction while attacking.', cost: 1, unlocked: false, children: {} },
        parry_window: { name: 'Parry Window', description: 'Successful parries briefly stun enemies.', cost: 1, unlocked: false, children: {} },
        bulwark_dash: { name: 'Bulwark Dash', description: 'Dashing grants a short shield.', cost: 2, unlocked: false, children: {} },
        retribution_aura: { name: 'Retribution Aura', description: 'Taking damage emits a small shockwave.', cost: 2, unlocked: false, children: {} },
        unbreakable: { name: 'Unbreakable', description: 'Survive one lethal hit per wave.', cost: 3, unlocked: false, children: {} }
      }
    },
    battle_momentum: {
      name: 'Battle Momentum',
      description: 'Mobility and kill-chain tempo scaling.',
      cost: 1,
      unlocked: false,
      children: {
        warriors_step: { name: 'Warrior\'s Step', description: '+15% movement speed.', cost: 1, unlocked: false, children: {} },
        adrenal_surge: { name: 'Adrenal Surge', description: 'Elite kills grant temporary haste.', cost: 1, unlocked: false, children: {} },
        sweeping_advance: { name: 'Sweeping Advance', description: 'Dash attacks hit in a wide arc.', cost: 2, unlocked: false, children: {} },
        blood_rush: { name: 'Blood Rush', description: 'Movement speed rises as HP drops.', cost: 2, unlocked: false, children: {} },
        blade_cyclone: { name: 'Blade Cyclone', description: 'After 10 kills, unleash spinning AoE slash.', cost: 3, unlocked: false, children: {} }
      }
    }
  },
  brute: {
    titan_strength: {
      name: 'Titan Strength',
      description: 'Raw impact and heavy melee damage scaling.',
      cost: 1,
      unlocked: false,
      children: {
        heavy_hands: { name: 'Heavy Hands', description: '+25% melee impact damage.', cost: 1, unlocked: false, children: {} },
        groundbreaker: { name: 'Groundbreaker', description: 'Slam attacks create larger shockwaves.', cost: 1, unlocked: false, children: {} },
        crushing_momentum: { name: 'Crushing Momentum', description: 'Attacks knock enemies farther.', cost: 2, unlocked: false, children: {} },
        seismic_burst: { name: 'Seismic Burst', description: 'Every 5th hit triggers a quake.', cost: 2, unlocked: false, children: {} },
        titans_wrath: { name: 'Titan\'s Wrath', description: 'Slam cooldown reduced by 40%.', cost: 3, unlocked: false, children: {} }
      }
    },
    iron_body: {
      name: 'Iron Body',
      description: 'Tankiness, sustain, and steadfast brawling.',
      cost: 1,
      unlocked: false,
      children: {
        stone_skin: { name: 'Stone Skin', description: '+30% max HP.', cost: 1, unlocked: false, children: {} },
        thickened_armor: { name: 'Thickened Armor', description: 'Flat damage reduction from all hits.', cost: 1, unlocked: false, children: {} },
        second_wind: { name: 'Second Wind', description: 'Regenerate HP slowly out of combat.', cost: 2, unlocked: false, children: {} },
        fortified_stance: { name: 'Fortified Stance', description: 'Standing still grants temporary armor.', cost: 2, unlocked: false, children: {} },
        juggernaut: { name: 'Juggernaut', description: 'Immune to stuns and knockbacks.', cost: 3, unlocked: false, children: {} }
      }
    },
    arena_dominance: {
      name: 'Arena Dominance',
      description: 'Control space with denial and pressure tools.',
      cost: 1,
      unlocked: false,
      children: {
        molten_footsteps: { name: 'Molten Footsteps', description: 'Walking leaves damaging lava trails.', cost: 1, unlocked: false, children: {} },
        shockwave_pulse: { name: 'Shockwave Pulse', description: 'Taking damage emits an AoE blast.', cost: 1, unlocked: false, children: {} },
        gravity_crush: { name: 'Gravity Crush', description: 'Slam pulls enemies inward before blast.', cost: 2, unlocked: false, children: {} },
        rage_aura: { name: 'Rage Aura', description: 'Nearby enemies deal 20% less damage.', cost: 2, unlocked: false, children: {} },
        worldbreaker: { name: 'Worldbreaker', description: 'Ultimate slam creates arena hazards.', cost: 3, unlocked: false, children: {} }
      }
    }
  },
  archer: {
    marksmans_path: {
      name: 'Marksman\'s Path',
      description: 'Accuracy, crit scaling, and precision burst.',
      cost: 1,
      unlocked: false,
      children: {
        piercing_arrow: { name: 'Piercing Arrow', description: 'Shots pierce one additional target.', cost: 1, unlocked: false, children: {} },
        eagle_eye: { name: 'Eagle Eye', description: '+25% crit chance at long range.', cost: 1, unlocked: false, children: {} },
        quick_draw: { name: 'Quick Draw', description: 'Faster attack speed after dodging.', cost: 2, unlocked: false, children: {} },
        weakpoint_mastery: { name: 'Weakpoint Mastery', description: 'Weakpoint hits deal +75% damage.', cost: 2, unlocked: false, children: {} },
        rain_of_arrows: { name: 'Rain of Arrows', description: 'Charged shots fire a small volley.', cost: 3, unlocked: false, children: {} }
      }
    },
    mobility_evasion: {
      name: 'Mobility & Evasion',
      description: 'Speed and survivability through movement.',
      cost: 1,
      unlocked: false,
      children: {
        wind_step: { name: 'Wind Step', description: '+20% movement speed while firing.', cost: 1, unlocked: false, children: {} },
        shadow_dodge: { name: 'Shadow Dodge', description: 'Dodging leaves behind a decoy.', cost: 1, unlocked: false, children: {} },
        acrobats_grace: { name: 'Acrobat\'s Grace', description: 'Reduce dash cooldown by 30%.', cost: 2, unlocked: false, children: {} },
        featherfall: { name: 'Featherfall', description: 'Brief slow-time after dodging.', cost: 2, unlocked: false, children: {} },
        phantom_volley: { name: 'Phantom Volley', description: 'First shot after dodge fires two arrows.', cost: 3, unlocked: false, children: {} }
      }
    },
    traps_tactical_control: {
      name: 'Traps & Tactical Control',
      description: 'Utility, zoning, and target focus tools.',
      cost: 1,
      unlocked: false,
      children: {
        snare_trap: { name: 'Snare Trap', description: 'Drop a slowing trap on dodge.', cost: 1, unlocked: false, children: {} },
        explosive_arrow: { name: 'Explosive Arrow', description: 'Every 6th shot explodes.', cost: 1, unlocked: false, children: {} },
        vine_bind: { name: 'Vine Bind', description: 'Close-range hits briefly root enemies.', cost: 2, unlocked: false, children: {} },
        hunters_mark: { name: 'Hunter\'s Mark', description: 'Marked enemies take +20% all damage.', cost: 2, unlocked: false, children: {} },
        natures_wrath: { name: 'Nature\'s Wrath', description: 'Marked kill triggers chain explosion.', cost: 3, unlocked: false, children: {} }
      }
    }
  },
  gunner: {
    ballistics_expert: {
      name: 'Ballistics Expert',
      description: 'Bullet damage and sustained fire pressure.',
      cost: 1,
      unlocked: false,
      children: {
        overclocked_rounds: { name: 'Overclocked Rounds', description: '+20% bullet damage.', cost: 1, unlocked: false, children: {} },
        ricochet_shot: { name: 'Ricochet Shot', description: 'Bullets bounce once.', cost: 1, unlocked: false, children: {} },
        full_auto: { name: 'Full Auto', description: 'Sustained fire increases fire rate.', cost: 2, unlocked: false, children: {} },
        critical_overdrive: { name: 'Critical Overdrive', description: 'Critical hits refund ammo.', cost: 2, unlocked: false, children: {} },
        bullet_storm: { name: 'Bullet Storm', description: 'Reloading triggers radial bullet burst.', cost: 3, unlocked: false, children: {} }
      }
    },
    gadgeteer: {
      name: 'Gadgeteer',
      description: 'Utility gadgets and tactical automation.',
      cost: 1,
      unlocked: false,
      children: {
        shock_mine: { name: 'Shock Mine', description: 'Drop a mine on reload.', cost: 1, unlocked: false, children: {} },
        drone_buddy: { name: 'Drone Buddy', description: 'A drone fires weak nearby shots.', cost: 1, unlocked: false, children: {} },
        emp_burst: { name: 'EMP Burst', description: 'Gadgets disable enemy buffs.', cost: 2, unlocked: false, children: {} },
        auto_turret: { name: 'Auto-Turret', description: 'Deploy a temporary turret every few waves.', cost: 2, unlocked: false, children: {} },
        tech_overload: { name: 'Tech Overload', description: 'All gadgets activate on ultimate use.', cost: 3, unlocked: false, children: {} }
      }
    },
    chaos_engineering: {
      name: 'Chaos Engineering',
      description: 'Explosive and elemental chaos interactions.',
      cost: 1,
      unlocked: false,
      children: {
        micro_grenades: { name: 'Micro-Grenades', description: 'Every 10th shot fires a tiny grenade.', cost: 1, unlocked: false, children: {} },
        volatile_ammo: { name: 'Volatile Ammo', description: 'Enemies explode on death.', cost: 1, unlocked: false, children: {} },
        chain_reaction: { name: 'Chain Reaction', description: 'Explosions trigger mini-explosions.', cost: 2, unlocked: false, children: {} },
        chaos_rounds: { name: 'Chaos Rounds', description: 'Bullets gain random elemental effects.', cost: 2, unlocked: false, children: {} },
        annihilation_protocol: { name: 'Annihilation Protocol', description: 'Ultimate fires a massive explosive beam.', cost: 3, unlocked: false, children: {} }
      }
    }
  }
};

class LevelingSystem {
  constructor(role = 'Male') {
    const validRole = role && skillTrees[role] ? role : 'Male';
    this.xp = 0;
    this.level = 1;
    this.tokens = 0;
    this.skillTree = JSON.parse(JSON.stringify(skillTrees[validRole]));
  }

  resolveSkillPath(path) {
    const segments = Array.isArray(path) ? path : [path];
    if (!segments.length) {
      return { node: null, parent: null };
    }

    let container = this.skillTree;
    let parent = null;
    let node = null;

    for (const key of segments) {
      if (!container || typeof container !== 'object' || !container[key]) {
        return { node: null, parent: null };
      }

      parent = node;
      node = container[key];
      container = node.children || {};
    }

    return { node, parent };
  }

  addXP(amount) {
    this.xp += amount;
    while (this.level < LEVEL_XP.length && this.xp >= LEVEL_XP[this.level]) {
      this.level++;
      this.tokens++;
    }
  }

  unlockSkill(path) {
    const { node, parent } = this.resolveSkillPath(path);
    if (!node || node.unlocked) {
      return false;
    }

    if (parent && !parent.unlocked) {
      return false;
    }

    if (this.tokens < node.cost) {
      return false;
    }

    node.unlocked = true;
    this.tokens -= node.cost;
    return true;
  }

  getUnlockedSkills() {
    const unlocked = [];
    function traverse(node, path) {
      for (const key in node) {
        if (node[key].unlocked) unlocked.push([...path, key]);
        if (node[key].children) traverse(node[key].children, [...path, key]);
      }
    }
    traverse(this.skillTree, []);
    return unlocked;
  }
}

export { LevelingSystem, LEVEL_XP, skillTrees };
