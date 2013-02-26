Game = {
	start: function () {
		Crafty.init(600, 400);
		Crafty.background('black');
		Crafty.settings.modify('autoPause', true);

		var random = Crafty.math.randomInt;

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

			Crafty.bind('EnterFrame', function (e) {
				// Generate a random FollowingEnemy every few seconds

				if (e.frame === 0 || e.frame % 120 === 0) {
					// side: left = 1, up = 2, right = 3, down = 4
					var side = random(1, 4);
					var speed = Crafty.math.randomNumber(1, 2);

					if (side === 1) {
						Crafty.e('FollowingEnemy').followingenemy(random(-200, -50), random(-100, 500), speed);
					} else if (side === 2) {
						Crafty.e('FollowingEnemy').followingenemy(random(-100, 700), random(-200, -50), speed);
					} else if (side === 3) {
						Crafty.e('FollowingEnemy').followingenemy(random(650, 800), random(-100, 500), speed);
					} else if (side === 4) {
						Crafty.e('FollowingEnemy').followingenemy(random(-100, 700), random(450, 600), speed);
					}
				}
			});
		});

		Crafty.scene('Gameplay');
	}
}
