Game = {
	start: function () {
		Crafty.init(600, 400);
		Crafty.background('black');
		Crafty.settings.modify('autoPause', true);

		var random = Crafty.math.randomInt;
		var wave = 1;

		Crafty.scene('Gameplay', function () {
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

			// Display score
			Crafty.e('Score, DOM, 2D, Text')
				.attr({ x:20, y:20, w:200, h:20, z:1, score:0 })
				.text('Score: 0')
				.textColor('#FFFFFF');

			Crafty.bind('reset', function () {
				Crafty('Player').destroy();
				Crafty('Enemy').each(function () { this.destroy(); });
				Crafty('FollowingEnemy').each(function () { this.destroy(); });

				Crafty.e('Player');
			});

			var enemies = 0;
			Crafty.bind('EnterFrame', function (e) {

				// Make the game harder on higher waves, faster and new enemies
				if (wave === 1) {
					// Only generate 20 enemies
					if (enemies < 20) {
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
						// If there are more than 20 enemies, go onto the next wave
						wave++;
						enemies = 0;
					}
				} else if (wave === 2) {
					if (enemies < 20) {
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
								Crafty.e('ShootingEnemy').shootingenemy(x, y, speed);
							}

							enemies++;
						}
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
								Crafty.e('ShootingEnemy').shootingenemy(x, y, speed);
							}

							if (twoEnemies === 2) {
								if (enemyType === 1) {
									Crafty.e('FollowingEnemy').followingenemy(x, y, speed);
								} else if (enemyType === 2) {
									Crafty.e('ShootingEnemy').shootingenemy(x, y, speed);
								}
							}

							enemies++;
						//}
					}
				}
			});
		});

		Crafty.scene('Gameplay');
	}
}

// Remove array item
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
