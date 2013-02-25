Crafty.c('Player', {
	init: function () {
		this.requires('Fourway, Color, DOM, MouseFollow, Keyboard, Collision')
			.attr({ x:300, y:200, w:20, h:20, z:1 })
			.color('rgb(20, 125, 40)')
			.fourway(2);

		this.origin('center');

		this.bind('EnterFrame', function () {
			// Stop movement on screen edge
			if (this.x < 0) {
				this.x = 0;
			}
			else if (this.x + this.w > 600) {
				this.x = 600 - this.w;
			}
			if (this.y < 0) {
				this.y = 0;
			}
			else if (this.y + this.h > 400) {
				this.y = 400 - this.h;
			}

			// Destroy this and the MouseFollow entity if hit enemy
			if (this.hit('Enemy')) {
				this.removeComponent('MouseFollow', false);
				this.destroy();
			}
		})
	}
});

Crafty.c('MouseFollow', {
	init: function () {
		this.requires('2D');
		
		var mouseX = 0;
		var mouseY = 0;

		var x = 0;
		var y = 0;
		var rotation = 0;

		this.bind('mousemovement', function (e) {
			mouseX = Crafty.mousePos.x;
			mouseY = Crafty.mousePos.y;
		});

		this.bind('clickedscreen', function (e) {
			// If the player left clicks the screen, fire a bullet in the direction we are facing
			// TODO: replace height and width with actual generic calculations
			if (e.mouseButton === Crafty.mouseButtons.LEFT) {
				Crafty.e('Bullet').bullet(x + 9, y + 9, rotation);
			}
		})

		this.bind('EnterFrame', function () {
			// Use trig to find rotation amount, we add 90 to line the 0 value with the y-axis instead of the x-axis
			this.rotation = (Math.atan2(mouseY - this.y, mouseX - this.x) * 180 / Math.PI) + 90;

			x = this.x;
			y = this.y;
			rotation = this.rotation;
		});
	}
});

Crafty.c('Bullet', {
	init: function () {
		this.requires('2D, Color, DOM')
			.attr({ x:0, y:0, w:3, h:3, z:0 })
			.color('rgb(255, 255, 0)');

		this.origin('center');
	},

	bullet: function (x, y, direction) {
		this.x = x;
		this.y = y;

		var speed = 5;

		this.bind('EnterFrame', function () {
			this.rotation = direction;

			this.x += Math.sin(direction * (Math.PI / 180)) * speed;
			this.y -= Math.cos(direction * (Math.PI / 180)) * speed;

			// TODO: Get rid of hardcoded screen width and height
			if (this.x < -100 || this.x > 700 || this.y < -100 || this.y > 500) {
				this.destroy();
			}
		})
	}
});

Crafty.c('Enemy', {
	init: function () {
		this.requires('2D, Color, DOM, Collision')
			.attr({ x:0, y:0, w:15, h:15, z:1 })
			.color('rgb(255, 0, 0)');

		this.origin('center');

		this.bind('EnterFrame', function () {
			// If hit by bullet, destroy the enemy and the bullet and increment the player's score
			var b = this.hit('Bullet')
			if (b) {

				// Remove entities
				this.destroy();
				b[0].obj.destroy();

				// Update score
				Crafty('Score').each(function() {
					this.score += 100;
					this.text('Score: ' + this.score);
				});
			}

			if (Crafty('Player').length == 0) {
				this.destroy();
			}
		});
	},

	enemy: function (x, y) {
		this.x = x;
		this.y = y;
	}
});

Crafty.c('FollowingEnemy', {
	init: function () {
		this.requires('Enemy');
	},

	followingenemy: function (x, y, speed) {
		this.x = x;
		this.y = y;
		var s = speed;

		this.bind('EnterFrame', function () {
			var playerX = Crafty('Player').x;
			var playerY = Crafty('Player').y;

			// Find angle between enemy and player
			this.rotation = (Math.atan2(playerY - this.y, playerX - this.x) * 180 / Math.PI) + 90;

			this.x += Math.sin(this.rotation * (Math.PI / 180)) * s;
			this.y -= Math.cos(this.rotation * (Math.PI / 180)) * s;
		});
	}
});

Crafty.c('Particles', {
	init: function () {
		this.requires('2D, Canvas')
			.attr({ x:0, y:0 });
	},

	particles: function () {

	}
});
