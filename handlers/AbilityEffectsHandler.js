import {
	createAbilityUnlockCelebration,
	createCombatUnlockPulse,
	createExplosiveRoundImpact,
	createSkillTrail
} from '../helpers/abilityEffectsHelpers.js';

const SKILL_METADATA = {
	'melee_mastery.slash': {
		title: 'Slash',
		subtitle: 'Blade arcs leave shimmering trails',
		color: 0xffe8a3
	},
	'melee_mastery.shockwave': {
		title: 'Shockwave',
		subtitle: 'Impact waves now carry a radiant pulse',
		color: 0xffb85c
	},
	'bow_mastery.volley': {
		title: 'Volley',
		subtitle: 'Arrows now split with a fan of light',
		color: 0xf5d25e
	},
	'bow_mastery.rapid_shot': {
		title: 'Rapid Shot',
		subtitle: 'Shots streak with speed-line afterimages',
		color: 0x8fd6ff
	},
	'brute_force.ground_slam': {
		title: 'Ground Slam',
		subtitle: 'Slams now crack the battlefield with force',
		color: 0xff9a7a
	},
	'brute_force.intimidate': {
		title: 'Intimidate',
		subtitle: 'A fear pulse erupts around each heavy strike',
		color: 0xc797ff
	},
	'gun_mastery.burst': {
		title: 'Burst',
		subtitle: 'Burst fire gains a vivid muzzle cascade',
		color: 0xffdc7a
	},
	'gun_mastery.explosive_rounds': {
		title: 'Explosive Rounds',
		subtitle: 'Bullets now detonate on impact',
		color: 0xff8a45
	}
};

export class AbilityEffectsHandler {
	constructor(scene) {
		this.scene = scene;
		this.leveling = null;
	}

	normalizeRole(role) {
		if (role === 'WARRIOR') return 'Male';
		return role;
	}

	setLeveling(leveling) {
		this.leveling = leveling || null;
	}

	hasSkill(path) {
		if (!this.leveling || !path) return false;
		const segments = Array.isArray(path) ? path : String(path).split('.').filter(Boolean);
		if (!segments.length) return false;

		if (typeof this.leveling.resolveSkillPath === 'function') {
			const { node } = this.leveling.resolveSkillPath(segments);
			return Boolean(node?.unlocked);
		}

		let container = this.leveling.skillTree;
		let node = null;
		for (const segment of segments) {
			if (!container || !container[segment]) {
				return false;
			}
			node = container[segment];
			container = node.children || {};
		}
		return Boolean(node?.unlocked);
	}

	showUnlockCelebration(skillPath, fallbackName = 'Skill') {
		const key = Array.isArray(skillPath) ? skillPath.join('.') : String(skillPath);
		const meta = SKILL_METADATA[key] || {
			title: fallbackName,
			subtitle: 'A new combat effect has awakened',
			color: 0x9fc6ff
		};

		const centerX = this.scene.scale.width / 2;
		const centerY = this.scene.scale.height * 0.28;
		createAbilityUnlockCelebration(this.scene, {
			x: centerX,
			y: centerY,
			title: meta.title,
			subtitle: meta.subtitle,
			color: meta.color
		});

		this.scene.safeCameraShake?.(90, 0.012, 100);
	}

	onProjectileSpawn(projectile, role, source = 'basic') {
		if (!projectile) return;
		const normalizedRole = this.normalizeRole(role);

		if (normalizedRole === 'gunner' && this.hasSkill('gun_mastery.explosive_rounds')) {
			projectile.explosiveRounds = true;
			projectile.explosionRadius = 78;
			projectile.explosionDamageScale = 0.55;
			projectile.explosionColor = 0xff8844;
		}

		if (normalizedRole === 'archer' && this.hasSkill('bow_mastery.rapid_shot')) {
			projectile.rapidTrail = true;
		}

		if (source === 'ability' && normalizedRole === 'gunner' && this.hasSkill('gun_mastery.burst')) {
			createCombatUnlockPulse(this.scene, projectile.x, projectile.y, 0xffdd88);
		}
	}

	onProjectileStep(projectile) {
		if (!projectile) return;
		if (projectile.rapidTrail) {
			createSkillTrail(this.scene, projectile.x, projectile.y, 0x95dcff, 2.4);
		}
	}

	onProjectileHit(projectile, impactX, impactY, enemies, hitEnemy, damageEnemyFn) {
		if (!projectile?.explosiveRounds || !Array.isArray(enemies) || !damageEnemyFn) {
			return;
		}

		const radius = projectile.explosionRadius || 72;
		const baseDamage = projectile.damage || 0;
		const splashScale = projectile.explosionDamageScale || 0.5;
		const color = projectile.explosionColor || 0xff8844;

		createExplosiveRoundImpact(this.scene, impactX, impactY, color, radius);
		this.scene.safeCameraShake?.(65, 0.012, 70);

		for (let i = 0; i < enemies.length; i++) {
			const enemyData = enemies[i];
			if (!enemyData?.enemy || enemyData === hitEnemy) continue;

			const dx = enemyData.enemy.x - impactX;
			const dy = enemyData.enemy.y - impactY;
			const dist = Math.hypot(dx, dy);
			if (dist > radius) continue;

			const rawFalloff = 1 - (dist / radius);
			const falloff = Math.max(0.25, Math.min(1, rawFalloff));
			const splashDamage = baseDamage * splashScale * falloff;
			const knock = dist ? { x: dx / dist, y: dy / dist } : { x: 0, y: 0 };
			damageEnemyFn(enemyData, splashDamage, { x: knock.x * 0.9, y: knock.y * 0.9 });
		}
	}

	onBasicAttack(role, playerX, playerY) {
		const normalizedRole = this.normalizeRole(role);

		if (normalizedRole === 'Male' && this.hasSkill('melee_mastery.slash')) {
			createCombatUnlockPulse(this.scene, playerX, playerY, 0xffe7a0);
		}

		if (normalizedRole === 'brute' && this.hasSkill('brute_force.intimidate')) {
			createCombatUnlockPulse(this.scene, playerX, playerY, 0xc79aff);
		}
	}

	onAbilityCast(role, playerX, playerY) {
		const normalizedRole = this.normalizeRole(role);

		if (normalizedRole === 'Male' && this.hasSkill('melee_mastery.shockwave')) {
			createCombatUnlockPulse(this.scene, playerX, playerY, 0xffbb66);
		}

		if (normalizedRole === 'archer' && this.hasSkill('bow_mastery.volley')) {
			createCombatUnlockPulse(this.scene, playerX, playerY, 0xf2d46e);
		}

		if (normalizedRole === 'brute' && this.hasSkill('brute_force.ground_slam')) {
			createCombatUnlockPulse(this.scene, playerX, playerY, 0xff9c7d);
		}
	}
}
