import {
	createAbilityUnlockCelebration,
	createCombatUnlockPulse,
	createExplosiveRoundImpact,
	createSkillTrail
} from '../helpers/abilityEffectsHelpers.js';

const SKILL_METADATA = {
	'blade_mastery.arc_slash': {
		title: 'Slash',
		subtitle: 'Blade arcs leave shimmering trails',
		color: 0xffe8a3
	},
	'battle_momentum.blade_cyclone': {
		title: 'Shockwave',
		subtitle: 'Impact waves now carry a radiant pulse',
		color: 0xffb85c
	},
	'marksmans_path.rain_of_arrows': {
		title: 'Volley',
		subtitle: 'Arrows now split with a fan of light',
		color: 0xf5d25e
	},
	'marksmans_path.quick_draw': {
		title: 'Rapid Shot',
		subtitle: 'Shots streak with speed-line afterimages',
		color: 0x8fd6ff
	},
	'titan_strength.groundbreaker': {
		title: 'Ground Slam',
		subtitle: 'Slams now crack the battlefield with force',
		color: 0xff9a7a
	},
	'arena_dominance.rage_aura': {
		title: 'Intimidate',
		subtitle: 'A fear pulse erupts around each heavy strike',
		color: 0xc797ff
	},
	'ballistics_expert.bullet_storm': {
		title: 'Burst',
		subtitle: 'Burst fire gains a vivid muzzle cascade',
		color: 0xffdc7a
	},
	'chaos_engineering.volatile_ammo': {
		title: 'Explosive Rounds',
		subtitle: 'Bullets now detonate on impact',
		color: 0xff8a45
	},
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

const ROLE_SKILL_LINKS = {
	Male: {
		basic: [
			'blade_mastery.sharpened_edge', 'blade_mastery.combo_flow', 'blade_mastery.perfect_strike', 'blade_mastery.arc_slash', 'blade_mastery.executioners_rhythm',
			'battle_momentum.warriors_step', 'battle_momentum.adrenal_surge', 'battle_momentum.sweeping_advance', 'battle_momentum.blood_rush', 'battle_momentum.blade_cyclone',
			'guardians_resolve.iron_guard', 'guardians_resolve.parry_window', 'guardians_resolve.bulwark_dash', 'guardians_resolve.retribution_aura', 'guardians_resolve.unbreakable'
		],
		ability: [
			'blade_mastery.arc_slash', 'blade_mastery.executioners_rhythm',
			'battle_momentum.sweeping_advance', 'battle_momentum.blade_cyclone',
			'guardians_resolve.retribution_aura', 'guardians_resolve.unbreakable'
		]
	},
	archer: {
		basic: [
			'marksmans_path.piercing_arrow', 'marksmans_path.eagle_eye', 'marksmans_path.quick_draw', 'marksmans_path.weakpoint_mastery', 'marksmans_path.rain_of_arrows',
			'mobility_evasion.wind_step', 'mobility_evasion.shadow_dodge', 'mobility_evasion.acrobats_grace', 'mobility_evasion.featherfall', 'mobility_evasion.phantom_volley',
			'traps_tactical_control.snare_trap', 'traps_tactical_control.explosive_arrow', 'traps_tactical_control.vine_bind', 'traps_tactical_control.hunters_mark', 'traps_tactical_control.natures_wrath'
		],
		ability: [
			'marksmans_path.rain_of_arrows',
			'traps_tactical_control.explosive_arrow', 'traps_tactical_control.hunters_mark', 'traps_tactical_control.natures_wrath'
		]
	},
	brute: {
		basic: [
			'titan_strength.heavy_hands', 'titan_strength.groundbreaker', 'titan_strength.crushing_momentum', 'titan_strength.seismic_burst', 'titan_strength.titans_wrath',
			'iron_body.stone_skin', 'iron_body.thickened_armor', 'iron_body.second_wind', 'iron_body.fortified_stance', 'iron_body.juggernaut',
			'arena_dominance.molten_footsteps', 'arena_dominance.shockwave_pulse', 'arena_dominance.gravity_crush', 'arena_dominance.rage_aura', 'arena_dominance.worldbreaker'
		],
		ability: [
			'titan_strength.groundbreaker', 'titan_strength.seismic_burst', 'titan_strength.titans_wrath',
			'arena_dominance.gravity_crush', 'arena_dominance.worldbreaker'
		]
	},
	gunner: {
		basic: [
			'ballistics_expert.overclocked_rounds', 'ballistics_expert.ricochet_shot', 'ballistics_expert.full_auto', 'ballistics_expert.critical_overdrive', 'ballistics_expert.bullet_storm',
			'gadgeteer.shock_mine', 'gadgeteer.drone_buddy', 'gadgeteer.emp_burst', 'gadgeteer.auto_turret', 'gadgeteer.tech_overload',
			'chaos_engineering.micro_grenades', 'chaos_engineering.volatile_ammo', 'chaos_engineering.chain_reaction', 'chaos_engineering.chaos_rounds', 'chaos_engineering.annihilation_protocol'
		],
		ability: [
			'ballistics_expert.bullet_storm',
			'gadgeteer.shock_mine', 'gadgeteer.auto_turret', 'gadgeteer.tech_overload',
			'chaos_engineering.volatile_ammo', 'chaos_engineering.chain_reaction', 'chaos_engineering.annihilation_protocol'
		]
	}
};

export class AbilityEffectsHandler {
	constructor(scene) {
		this.scene = scene;
		this.leveling = null;
	}

	normalizeRole(role) {
		if (role === 'WARRIOR' || role === 'MALE') return 'Male';
		return role;
	}

	hasAnySkill(paths = []) {
		if (!Array.isArray(paths) || !paths.length) return false;
		for (let i = 0; i < paths.length; i++) {
			if (this.hasSkill(paths[i])) return true;
		}
		return false;
	}

	formatSkillNameFromPath(path) {
		const key = Array.isArray(path) ? path[path.length - 1] : String(path).split('.').pop();
		if (!key) return 'Skill';
		return key
			.replace(/_/g, ' ')
			.replace(/\b\w/g, c => c.toUpperCase());
	}

	resolveSkillColor(path) {
		const key = Array.isArray(path) ? path.join('.') : String(path);
		if (key.startsWith('blade_mastery') || key.startsWith('guardians_resolve') || key.startsWith('battle_momentum')) return 0xffb869;
		if (key.startsWith('titan_strength') || key.startsWith('iron_body') || key.startsWith('arena_dominance')) return 0xff9a7a;
		if (key.startsWith('marksmans_path') || key.startsWith('mobility_evasion') || key.startsWith('traps_tactical_control')) return 0x8fd6ff;
		if (key.startsWith('ballistics_expert') || key.startsWith('gadgeteer') || key.startsWith('chaos_engineering')) return 0xffc975;
		return 0x9fc6ff;
	}

	resolveSkillSubtitle(path) {
		const key = Array.isArray(path) ? path.join('.') : String(path);
		if (key.startsWith('blade_mastery') || key.startsWith('guardians_resolve') || key.startsWith('battle_momentum')) return 'Warrior techniques surge with refined combat energy';
		if (key.startsWith('titan_strength') || key.startsWith('iron_body') || key.startsWith('arena_dominance')) return 'Brute pressure deepens with crushing arena force';
		if (key.startsWith('marksmans_path') || key.startsWith('mobility_evasion') || key.startsWith('traps_tactical_control')) return 'Archer precision and control patterns intensify';
		if (key.startsWith('ballistics_expert') || key.startsWith('gadgeteer') || key.startsWith('chaos_engineering')) return 'Gunner fire control gains volatile tactical output';
		return 'A new combat effect has awakened';
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
			title: fallbackName !== 'Skill' ? fallbackName : this.formatSkillNameFromPath(skillPath),
			subtitle: this.resolveSkillSubtitle(skillPath),
			color: this.resolveSkillColor(skillPath)
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
		const roleLinks = ROLE_SKILL_LINKS[normalizedRole];

		if (normalizedRole === 'Male' && this.hasAnySkill(roleLinks?.basic)) {
			projectile.warriorTrail = true;
		}

		if (normalizedRole === 'gunner' && (this.hasSkill('chaos_engineering.volatile_ammo') || this.hasSkill('gun_mastery.explosive_rounds'))) {
			projectile.explosiveRounds = true;
			projectile.explosionRadius = 78;
			projectile.explosionDamageScale = 0.55;
			projectile.explosionColor = 0xff8844;
		}

		if (normalizedRole === 'archer' && (this.hasSkill('marksmans_path.quick_draw') || this.hasSkill('bow_mastery.rapid_shot'))) {
			projectile.rapidTrail = true;
		}

		if (normalizedRole === 'archer' && this.hasAnySkill(roleLinks?.basic)) {
			projectile.archerTrail = true;
		}

		if (normalizedRole === 'gunner' && this.hasAnySkill(roleLinks?.basic)) {
			projectile.gunnerTrail = true;
		}

		if (source === 'ability' && normalizedRole === 'gunner' && (this.hasSkill('ballistics_expert.bullet_storm') || this.hasSkill('gun_mastery.burst'))) {
			createCombatUnlockPulse(this.scene, projectile.x, projectile.y, 0xffdd88);
		}
	}

	onProjectileStep(projectile) {
		if (!projectile) return;
		if (projectile.rapidTrail) {
			createSkillTrail(this.scene, projectile.x, projectile.y, 0x95dcff, 2.4);
		}
		if (projectile.warriorTrail) {
			createSkillTrail(this.scene, projectile.x, projectile.y, 0xffcb7f, 2.6);
		}
		if (projectile.archerTrail) {
			createSkillTrail(this.scene, projectile.x, projectile.y, 0x9fe6ff, 2.4);
		}
		if (projectile.gunnerTrail) {
			createSkillTrail(this.scene, projectile.x, projectile.y, 0xffb066, 2.5);
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
		const roleLinks = ROLE_SKILL_LINKS[normalizedRole];

		if (normalizedRole === 'Male' && this.hasAnySkill(roleLinks?.basic)) {
			createCombatUnlockPulse(this.scene, playerX, playerY, 0xffcb87);
		}

		if (normalizedRole === 'archer' && this.hasAnySkill(roleLinks?.basic)) {
			createCombatUnlockPulse(this.scene, playerX, playerY, 0xa9e8ff);
		}

		if (normalizedRole === 'brute' && this.hasAnySkill(roleLinks?.basic)) {
			createCombatUnlockPulse(this.scene, playerX, playerY, 0xff9f86);
		}

		if (normalizedRole === 'gunner' && this.hasAnySkill(roleLinks?.basic)) {
			createCombatUnlockPulse(this.scene, playerX, playerY, 0xffba72);
		}

		if (normalizedRole === 'Male' && (this.hasSkill('blade_mastery.arc_slash') || this.hasSkill('melee_mastery.slash'))) {
			createCombatUnlockPulse(this.scene, playerX, playerY, 0xffe7a0);
		}

		if (normalizedRole === 'brute' && (this.hasSkill('arena_dominance.rage_aura') || this.hasSkill('brute_force.intimidate'))) {
			createCombatUnlockPulse(this.scene, playerX, playerY, 0xc79aff);
		}
	}

	onAbilityCast(role, playerX, playerY) {
		const normalizedRole = this.normalizeRole(role);
		const roleLinks = ROLE_SKILL_LINKS[normalizedRole];

		if (this.hasAnySkill(roleLinks?.ability)) {
			const classColor = normalizedRole === 'Male'
				? 0xffba70
				: normalizedRole === 'archer'
					? 0x9bddff
					: normalizedRole === 'brute'
						? 0xff9a7d
						: 0xffca80;
			createCombatUnlockPulse(this.scene, playerX, playerY, classColor);
		}

		if (normalizedRole === 'Male' && (this.hasSkill('battle_momentum.blade_cyclone') || this.hasSkill('melee_mastery.shockwave'))) {
			createCombatUnlockPulse(this.scene, playerX, playerY, 0xffbb66);
		}

		if (normalizedRole === 'archer' && (this.hasSkill('marksmans_path.rain_of_arrows') || this.hasSkill('bow_mastery.volley'))) {
			createCombatUnlockPulse(this.scene, playerX, playerY, 0xf2d46e);
		}

		if (normalizedRole === 'brute' && (this.hasSkill('titan_strength.groundbreaker') || this.hasSkill('brute_force.ground_slam'))) {
			createCombatUnlockPulse(this.scene, playerX, playerY, 0xff9c7d);
		}
	}
}
