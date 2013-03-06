Game = {
	start: function () {
		Crafty.init(600, 400);
		Crafty.background('black');
		Crafty.settings.modify('autoPause', true);

		var random = Crafty.math.randomInt;

		Crafty.scene('Title', function () {
			var keyboardHandler = Crafty.e('Keyboard');
			keyboardHandler.bind('KeyDown', function () {
				if (this.isDown('ENTER')) {
					Crafty.scene('Gameplay');
				}
			});

			Crafty.e('DOM, 2D, Text')
				.attr({ x:90, y:180, w:500, z:1 })
				.text('Press enter to start game')
				.textColor('#FFFFFF')
				.css({'font-size': '180%'});
		});

		Crafty.scene('Gameplay', function () {
			// We use a background object to handle mouse movement and actions
			// over the whole screen by making it the width and height of the
			// screen and not drawing it. We do this because the Mouse component
			// events only trigger on the entity that the component is attached to.
			var background = Crafty.e('2D, Mouse, Keyboard').attr({ x:0, y:0, w:600, h:400 });
			background.bind('MouseMove', function (e) {
				Crafty.trigger('mousemovement', e);
			});
			background.bind('MouseDown', function (e) {
				Crafty.trigger('clickedscreen', e);
			});
			background.bind('KeyDown', function () {
				if (this.isDown('SPACE')) {
					Crafty.trigger('reset');
				}
			});

			Crafty.e('Starfield').starfield();

			Crafty.e('Player');

			//Crafty.e('Powerup').powerup(200, -20, 2, 'faster');
			//Crafty.e('ShootingEnemy').shootingenemy(200, 200, 2);

			// Display score
			Crafty.e('Score, DOM, 2D, Text')
				.attr({ x:20, y:20, w:200, h:20, z:1, score:0 })
				.text('Score: 0')
				.textColor('#FFFFFF')
				.css({'font-size': '150%'});

			Crafty.bind('reset', function () {
				// Clear game entities
				Crafty('Player').destroy();
				Crafty('Enemy').each(function () { this.destroy(); });
				Crafty('FollowingEnemy').each(function () { this.destroy(); });
				Crafty('ShootingEnemy').each(function () { this.destroy(); });
				Crafty('Bullet').each(function () { this.destroy(); });
				Crafty('Particles').each(function () { this.destroy(); });
				Crafty('Powerup').each(function () { this.destroy(); });

				// Update score
				Crafty('Score').each(function() {
					this.score = 0;
					this.text('Score: ' + this.score);
				});

				// Reset waves
				wave = 1;
				enemies = 0;

				Crafty.e('Player');
			});

			var enemies = 0;
			var wave = 1;
			var framesSincePowerup = 0;
			Crafty.bind('EnterFrame', function (e) {
				// If it has been longer than 1200 frames since a powerup was spawned, random chance of spawning one
				if (e.frame % 100 === 0 && framesSincePowerup >= 1200) {
					// 1: no powerup, 2: tripleshot, 3: invuln, 4: rapidfire
					var powerup = random(1, 4);
					var type = '';
					switch (powerup) {
						case 2:
							type = 'tripleshot';
							break;
						case 3:
							type = 'invuln';
							break;
						case 4:
							type = 'rapidfire'
							break;
					}
					// Spawn powerup
					if (powerup != 1) {
						Crafty.e('Powerup').powerup(random(100, 500), -20, 1, type);
						framesSincePowerup = 0;
					}
				}
				framesSincePowerup++;

				// Make the game harder on higher waves, faster and new enemies
				if (wave === 1) {
					// Only generate 40 enemies
					if (enemies < 40) {
						if (e.frame === 0 || e.frame % 120 === 0) {
							// side: left = 1, up = 2, right = 3, down = 4
							var side = random(1, 4);
							var speed = Crafty.math.randomNumber(1, 2);
							var x = 0;
							var y = 0;

							if (side === 1) {
								x = random(-200, -50);
								y = random(-100, 500);
							} else if (side === 2) {
								x = random(-100, 700);
								y = random(-200, -50);
							} else if (side === 3) {
								x = random(650, 800);
								y = random(-100, 500);
							} else if (side === 4) {
								x = random(-100, 700);
								y = random(450, 600);
							}
							
							Crafty.e('FollowingEnemy').followingenemy(x, y, speed);

							enemies++;
						}
					} else {
						// Enemy limit reached, go onto the next wave
						wave++;
						enemies = 0;
					}
				} else if (wave === 2) {
					if (enemies < 50) {
						if (e.frame % 100 === 0) {
							// side: left = 1, up = 2, right = 3, down = 4
							var side = random(1, 4);
							var speed = Crafty.math.randomNumber(1, 3);
							var x = 0;
							var y = 0;
							// enemyType: FollowingEnemy = 1, ShootingEnemy = 2
							var enemyType = random(1, 2);

							if (side === 1) {
								x = random(-200, -50);
								y = random(-100, 500);
							} else if (side === 2) {
								x = random(-100, 700);
								y = random(-200, -50);
							} else if (side === 3) {
								x = random(650, 800);
								y = random(-100, 500);
							} else if (side === 4) {
								x = random(-100, 700);
								y = random(450, 600);
							}

							if (enemyType === 1) {
								Crafty.e('FollowingEnemy').followingenemy(x, y, speed);
							} else if (enemyType === 2) {
								Crafty.e('ShootingEnemy').shootingenemy(x, y, speed, 50);
							}

							enemies++;
						}
					} else {
						// go onto the next wave
						wave++;
						enemies = 0;
					}
				} else if (wave === 3) {
					//if (enemies < 20) {
						if (e.frame % 80 === 0) {
							// side: left = 1, up = 2, right = 3, down = 4
							var side = random(1, 4);
							var speed = Crafty.math.randomNumber(1, 3);
							var x = 0;
							var y = 0;
							// enemyType: FollowingEnemy = 1, ShootingEnemy = 2
							var enemyType = random(1, 2);
							var twoEnemies = random(1, 2);

							if (side === 1) {
								x = random(-200, -50);
								y = random(-100, 500);
							} else if (side === 2) {
								x = random(-100, 700);
								y = random(-200, -50);
							} else if (side === 3) {
								x = random(650, 800);
								y = random(-100, 500);
							} else if (side === 4) {
								x = random(-100, 700);
								y = random(450, 600);
							}

							console.log("heee");
							
							if (enemyType === 1) {
								Crafty.e('FollowingEnemy').followingenemy(x, y, speed);
							} else if (enemyType === 2) {
								Crafty.e('ShootingEnemy').shootingenemy(x, y, speed, 30);
							}

							if (twoEnemies === 2) {
								if (enemyType === 1) {
									Crafty.e('FollowingEnemy').followingenemy(x, y, speed);
								} else if (enemyType === 2) {
									Crafty.e('ShootingEnemy').shootingenemy(x, y, speed, 30);
								}
							}

							enemies++;
						//}
					}
				}
			});
		});

		Crafty.scene('Title');
	}
}

// Remove array item
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
