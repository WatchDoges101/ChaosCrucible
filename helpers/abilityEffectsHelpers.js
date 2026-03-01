/**
 * Ability Effects Helpers
 * Visual helpers for skill unlock celebrations and ability-specific combat effects.
 */

function ignoreUiCamera(scene, targets) {
	if (!scene?.uiCamera || !targets) return;
	scene.uiCamera.ignore(targets);
}

export function createAbilityUnlockCelebration(scene, {
	x,
	y,
	title,
	subtitle,
	color = 0xffcc55
}) {
	const titleText = scene.add.text(x, y - 36, `UNLOCKED: ${title}`, {
		font: 'bold 30px Arial',
		fill: '#ffe9a8',
		stroke: '#000000',
		strokeThickness: 4
	}).setOrigin(0.5).setDepth(1300);

	const subtitleText = scene.add.text(x, y + 2, subtitle, {
		font: 'bold 18px Arial',
		fill: '#d6e7ff',
		stroke: '#000000',
		strokeThickness: 3
	}).setOrigin(0.5).setDepth(1300);

	const pulse = scene.add.circle(x, y + 48, 26, color, 0.5).setDepth(1290);
	const ring = scene.add.circle(x, y + 48, 36, color, 0.12).setStrokeStyle(3, color, 0.85).setDepth(1291);

	ignoreUiCamera(scene, [titleText, subtitleText, pulse, ring]);

	scene.tweens.add({
		targets: [titleText, subtitleText],
		y: '-=18',
		alpha: 0,
		duration: 920,
		ease: 'Quad.easeOut',
		onComplete: () => {
			titleText.destroy();
			subtitleText.destroy();
		}
	});

	scene.tweens.add({
		targets: pulse,
		scale: 2.1,
		alpha: 0,
		duration: 360,
		ease: 'Cubic.easeOut',
		onComplete: () => pulse.destroy()
	});

	scene.tweens.add({
		targets: ring,
		scale: 2.5,
		alpha: 0,
		duration: 420,
		ease: 'Cubic.easeOut',
		onComplete: () => ring.destroy()
	});

	for (let i = 0; i < 14; i++) {
		const angle = (i / 14) * Math.PI * 2;
		const spark = scene.add.circle(x, y + 48, 3, color, 0.95).setDepth(1295);
		ignoreUiCamera(scene, spark);
		scene.tweens.add({
			targets: spark,
			x: x + Math.cos(angle) * (42 + Math.random() * 20),
			y: y + 48 + Math.sin(angle) * (42 + Math.random() * 20),
			alpha: 0,
			scale: 0.5,
			duration: 360,
			ease: 'Quad.easeOut',
			onComplete: () => spark.destroy()
		});
	}
}

export function createCombatUnlockPulse(scene, x, y, color = 0x88ccff) {
	const pulse = scene.add.circle(x, y, 12, color, 0.45);
	pulse.setDepth(20);
	ignoreUiCamera(scene, pulse);

	scene.tweens.add({
		targets: pulse,
		scale: 2.5,
		alpha: 0,
		duration: 260,
		ease: 'Quad.easeOut',
		onComplete: () => pulse.destroy()
	});
}

export function createExplosiveRoundImpact(scene, x, y, color = 0xff8844, radius = 76) {
	const blast = scene.add.circle(x, y, radius * 0.32, color, 0.35);
	const ring = scene.add.circle(x, y, radius * 0.18, color, 0.05).setStrokeStyle(3, color, 0.95);
	blast.setDepth(25);
	ring.setDepth(26);
	ignoreUiCamera(scene, [blast, ring]);

	scene.tweens.add({
		targets: blast,
		scale: 2.6,
		alpha: 0,
		duration: 250,
		ease: 'Cubic.easeOut',
		onComplete: () => blast.destroy()
	});

	scene.tweens.add({
		targets: ring,
		scale: 3,
		alpha: 0,
		duration: 280,
		ease: 'Cubic.easeOut',
		onComplete: () => ring.destroy()
	});

	for (let i = 0; i < 10; i++) {
		const angle = (i / 10) * Math.PI * 2;
		const spark = scene.add.circle(x, y, 2.5, 0xffddaa, 0.95).setDepth(26);
		ignoreUiCamera(scene, spark);
		scene.tweens.add({
			targets: spark,
			x: x + Math.cos(angle) * (26 + Math.random() * 24),
			y: y + Math.sin(angle) * (26 + Math.random() * 24),
			alpha: 0,
			duration: 280,
			ease: 'Sine.out',
			onComplete: () => spark.destroy()
		});
	}
}

export function createSkillTrail(scene, x, y, color = 0x7ad0ff, size = 3) {
	const mote = scene.add.circle(x, y, size, color, 0.85).setDepth(18);
	ignoreUiCamera(scene, mote);
	scene.tweens.add({
		targets: mote,
		alpha: 0,
		scale: 0.5,
		duration: 170,
		ease: 'Sine.out',
		onComplete: () => mote.destroy()
	});
}
