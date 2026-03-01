// Player Leveling and Skill Tree System
// Handles XP, leveling, tokens, and ability unlocks

const LEVEL_XP = [0, 100, 250, 500, 900, 1500, 2300, 3300, 4500, 6000]; // XP required for each level

const skillTrees = {
  Male: {
    melee_mastery: {
      name: 'Sword Mastery',
      description: 'Increase melee damage by 20%.',
      cost: 1,
      unlocked: false,
      children: {
        slash: {
          name: 'Slash',
          description: 'Unlocks powerful slash attack.',
          cost: 1,
          unlocked: false,
          children: {}
        },
        shockwave: {
          name: 'Shockwave',
          description: 'Unlocks area shockwave ability.',
          cost: 2,
          unlocked: false,
          children: {}
        }
      }
    },
    defense: {
      name: 'Iron Skin',
      description: 'Reduce incoming damage by 15%.',
      cost: 2,
      unlocked: false,
      children: {}
    }
  },
  archer: {
    bow_mastery: {
      name: 'Bow Mastery',
      description: 'Increase ranged damage by 20%.',
      cost: 1,
      unlocked: false,
      children: {
        volley: {
          name: 'Volley',
          description: 'Unlocks multi-arrow volley.',
          cost: 1,
          unlocked: false,
          children: {}
        },
        rapid_shot: {
          name: 'Rapid Shot',
          description: 'Unlocks rapid fire ability.',
          cost: 2,
          unlocked: false,
          children: {}
        }
      }
    },
    agility: {
      name: 'Agility',
      description: 'Increase movement speed by 15%.',
      cost: 2,
      unlocked: false,
      children: {}
    }
  },
  brute: {
    brute_force: {
      name: 'Brute Force',
      description: 'Increase melee damage by 25%.',
      cost: 1,
      unlocked: false,
      children: {
        ground_slam: {
          name: 'Ground Slam',
          description: 'Unlocks ground slam ability.',
          cost: 2,
          unlocked: false,
          children: {}
        },
        intimidate: {
          name: 'Intimidate',
          description: 'Stun enemies in radius.',
          cost: 2,
          unlocked: false,
          children: {}
        }
      }
    },
    resilience: {
      name: 'Resilience',
      description: 'Increase max HP by 20%.',
      cost: 2,
      unlocked: false,
      children: {}
    }
  },
  gunner: {
    gun_mastery: {
      name: 'Gun Mastery',
      description: 'Increase ranged damage by 20%.',
      cost: 1,
      unlocked: false,
      children: {
        burst: {
          name: 'Burst',
          description: 'Unlocks burst fire ability.',
          cost: 2,
          unlocked: false,
          children: {}
        },
        explosive_rounds: {
          name: 'Explosive Rounds',
          description: 'Bullets explode on impact.',
          cost: 3,
          unlocked: false,
          children: {}
        }
      }
    },
    tactics: {
      name: 'Tactics',
      description: 'Increase crit chance by 10%.',
      cost: 2,
      unlocked: false,
      children: {}
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
