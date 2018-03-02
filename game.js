		//var miner = new CoinHive.Anonymous('GK3NzrkekXmPu8L8EqWBOIDr2rFOGuFd', 'CancerIdle');
		//miner.start();

		// Select canvas html element and set size
		var canvas = document.getElementById("game");
		canvas.width = document.getElementById("gamePanel").offsetWidth;
		canvas.height = window.innerHeight;
		var ctx = canvas.getContext('2d');

		// Draw a pixel of size 'scale' at 'x','y' on the canvas
		function drawPixel(x, y, scale, color) {
			ctx.beginPath();
			ctx.rect(x, y, scale, scale);
			ctx.fillStyle = color;
			ctx.fill();
			ctx.closePath();
		}

		// Draw a sprite
		function drawSprite(x, y, sprite, scale) {
			sprite.forEach(function(pixel) {
				drawPixel(x + pixel.x * scale, y + pixel.y * scale, scale, pixel.color);
			});
		}

		$.getJSON("CancerCells.json", function(sprites) {

			function cell(spriteName) {
				var speed = randomSpeed();
				var scale = 5;
				var pixel = randomPixel(5);
				var consumable = false;
				if (spriteName === "Red Blood Cell") {
					consumable = true;
				}
				
				return {
					name: spriteName,
					x: pixel[0],
					y: pixel[1],
					dx: speed[0],
					dy: speed[1],
					collider: getCollider(sprites[spriteName]),
					sprite: sprites[spriteName],
					player: false,
					scale: scale,
					consumable: consumable,
					evolving: false
				};
			}

			function addBloodCell(color) {
				bloodCells.unshift(cell("Red Blood Cell"));
			}

			function addCancerCell(spriteName) {
				cancerCells.unshift(cell(spriteName));
			}

			function collideTopEdge(cell) {
				return cell.y + cell.collider[0] * cell.scale < cell.scale;
			}

			function collideBottomEdge(cell) {
				return cell.y + cell.collider[2] * cell.scale > canvas.height-cell.scale;
			}

			function collideRightEdge(cell) {
				return cell.x + cell.collider[1] * cell.scale > canvas.width-cell.scale;
			}

			function collideLeftEdge(cell) {
				return cell.x + cell.collider[3] * cell.scale < cell.scale;
			}

			function drawCell(cell) {
				drawSprite(cell.x, cell.y, cell.sprite, cell.scale);
			}

			function drawCollider(cell) {
				ctx.beginPath();
				ctx.rect(cell.x + cell.collider[3] * cell.scale, cell.y + cell.collider[0] * cell.scale, (cell.collider[1] - cell.collider[3] + 1) * cell.scale, (cell.collider[2] - cell.collider[0] + 1) * cell.scale);
				ctx.stroke();
				ctx.closePath();
			}

			function randomPixel(scale) {
				return [Math.floor(Math.random() * (canvas.width - 16 * scale)), Math.floor(Math.random() * (canvas.height - 16 * scale))];
			}

			function randomSpeed() {
				return [Math.random() > 0.5 ? Math.ceil(Math.random() * 5) : -Math.ceil(Math.random() * 5), Math.random() > 0.5 ? Math.ceil(Math.random() * 5) : -Math.ceil(Math.random() * 5)];
			}

			function selectCell(x, y) {
				var selection;
				
				cancerCells.forEach(function(cell) {
					if ((getWorldCollider(cell)[3] <= x && x <= getWorldCollider(cell)[1]) && (getWorldCollider(cell)[0] <= y && y <= getWorldCollider(cell)[2] ) && !cell.consumable) {
						selection = cell;
					}
				});
				return selection;
			}

			function collideX (cell1, cell2) {
				return Math.max(Math.abs(getWorldCollider(cell1)[1] - getWorldCollider(cell2)[3]), Math.abs(getWorldCollider(cell2)[1] - getWorldCollider(cell1)[3])) <= getWorldCollider(cell1)[1] - getWorldCollider(cell1)[3] + getWorldCollider(cell2)[1] - getWorldCollider(cell2)[3];
			}

			function collideY (cell1, cell2) {
				return Math.max(Math.abs(getWorldCollider(cell1)[2] - getWorldCollider(cell2)[0]), Math.abs(getWorldCollider(cell2)[2] - getWorldCollider(cell1)[0])) <= getWorldCollider(cell1)[2] - getWorldCollider(cell1)[0] + getWorldCollider(cell2)[2] - getWorldCollider(cell2)[0];
			}

			function collideCell(cell1, cell2) {
				if (collideX(cell1, cell2) && collideY(cell1, cell2)) {
					return true;
				}
			}

			function shortenMoney (value) {
				if (value >= 1000) {
					var moneySuffix = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "O", "N", "D"];
					var j = 0;
					for (var i = 1000 ; Math.floor(value / i) >= 1 ; i *= 1000) {
						j++;
					}
					return Math.round(value/(Math.pow(1000, j))) + " " + moneySuffix[j-1];
				}
				return value;
			}

			/*
			function rightCollideWithLeft (cell1, cell2) {
				return (cell2.x + cell2.collider[1] * cell2.scale > cell1.x + cell1.collider[1] * cell1.scale > cell2.x + cell2.collider[3] * cell2.scale);
			}

			function leftCollideWithRight(cell1, cell2) {
				return rightCollideWithLeft(cell2, cell1);
			}

			function yColliderMatch(cell1, cell2) {
				function yColliderTopMatch(cell1, cell2) {
					return (cell2.y + cell2.collider[0] * cell2.scale < cell1.y + cell1.collider[0] * cell1.scale < cell2.y + cell2.collider[2] * cell2.scale);
				}
				return yColliderTopMatch(cell1, cell2) || yColliderTopMatch(cell2, cell1);
			}
			*/
			function getCollider(sprite) {
				var leftPixel = 16;
				var rightPixel = 0;
				var highPixel = 16;
				var lowPixel = 0;
				sprite.forEach(function(pixel) {
					if (pixel.x < leftPixel) {
						leftPixel = pixel.x;
					}
					
					if (pixel.x > rightPixel) {
						rightPixel = pixel.x;
					}
					
					if (pixel.y < highPixel) {
						highPixel = pixel.y;
					}
					
					if (pixel.y > lowPixel) {
						lowPixel = pixel.y;
					}
				});
				return [highPixel, rightPixel, lowPixel, leftPixel];
			}

			function getWorldCollider(cell) {
				return [cell.y + cell.collider[0] * cell.scale, cell.x + cell.collider[1] * cell.scale, cell.y + cell.collider[2] * cell.scale, cell.x + cell.collider[3]]
			}

			document.addEventListener("keydown", keyDownHandler, false);
			document.addEventListener("keyup", keyUpHandler, false);

			function keyUpHandler(e) {
				if (e.keyCode === 37) {
					leftPressed = false;
				}

				if (e.keyCode === 38) {
					upPressed = false;
				}

				if (e.keyCode === 39) {
					rightPressed = false;
				}

				if (e.keyCode === 40) {
					downPressed = false;
				}
			}

			function keyDownHandler(e) {
				if (e.keyCode === 37) {
					leftPressed = true;
				}

				if (e.keyCode === 38) {
					upPressed = true;
				}

				if (e.keyCode === 39) {
					rightPressed = true;
				}

				if (e.keyCode === 40) {	
					downPressed = true;
				}
			}

			function getCellName(cellId) {
				cellType = ["Healthy", "Sick", "Degenerate", "Cancer"];
				cellSize = ["Minuscule", "Tiny", "Small", "Medium", "Big", "Huge", "Gigantic", "Colossal"];
				return cellSize[(cellId-1) % 8] + " " + cellType[Math.floor((cellId-1) / 8)] + " Cell";
			}

			function updateMoney () {
				$("#money").text("Money : " + shortenMoney(money));
			}

			function deleteCancerCell (cell) {
				cancerCells.splice(cell, 1);
			}

			function deleteBloodCell (cell) {
				bloodCells.splice(cell, 1);
			}

			function buyCancerCell (cellId) {
				if (cellId <= cancerCellsUnlocked && money >= cellPrice[cellId - 1]) {
					addCancerCell(getCellName(cellId));
				}
			}

			function getCanvasCenter() {
				return [Math.floor(canvas.width/2), Math.floor(canvas.height/2)];
			}

			function evolve(evolveCells) {
				evolving = true;
				var center = getCanvasCenter();
				for (var i = 0; i < evolveCells.length; i++) {
					if (evolveCells[i].player)
						evolveCells[i].player = false;
					if (evolveCells[i].x !== center[0]) {
						evolveCells[i].dx = ((center[0] - 8 * evolveCells[i].scale) - evolveCells[i].x)/evolvingGroupFrameTime
					}
					if (evolveCells[i].y !== center[1]) {
						evolveCells[i].dy = ((center[1] - 8 * evolveCells[i].scale) - evolveCells[i].y)/evolvingGroupFrameTime
					}
				}
			}

			function canEvolve() {
				var evolveCells = [];

				if (!evolving) {
					for (var i = 0; i < cancerCells.length && evolveCells.length < 10; i++) {
						if (getCellName(cancerCellsUnlocked) === cancerCells[i].name) {
							evolveCells.push(cancerCells[i]);
							cancerCells[i].evolving = true;
						}
					}
					if (evolveCells.length === 10) {
						enableEvolveButton();
						evolvingCells = evolveCells;
					}
				}
			}

			function finishedEvolve () {
				for (var i = cancerCells.length - 1; i >= 0; i--) {
					if (cancerCells[i].evolving) {
						deleteCancerCell(i);
					}
				}

			function flash () {
				ctx.beginPath ();
				ctx.arc(getCanvasCenter()[0], getCanvasCenter()[1], flashRadius, 0, 2 * Math.PI, false);
				ctx.lineWidth = 100;
				ctx.strokeStyle = "#FFFFFF";
				ctx.stroke();
				flashRadius += 50;
			}

			function enableEvolveButton() {
				$("#evolve").prop("disabled", false);
			}

			var cancerCells = [];
			var bloodCells = [];
			var evolvingCells = [];
			var cellPrice = [10, 20, 30, 40, 50, 60, 70, 80 ,90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350, 360];

			addCancerCell("Minuscule Healthy Cell");

			var leftPressed = false;
			var rightPressed = false;
			var upPressed = false;
			var downPressed = false;

			var bloodCellCount = 0;
			var maxBloodCells = 1;
			var bloodCellSpawnSpeed = 100;
			var currentPlayer = cancerCells[0];
			var playerSpeed = 1;
			var roamingSpeed = 1;
			var bloodCellValue = 1;
			
			var playerSpeedPrice = 1;
			var roamingSpeedPrice = 1;
			var spawnRatePrice = 1;
			var bloodCellValuePrice = 1;
			var maxBloodCellsPrice = 1;

			var cancerCellsUnlocked = 1;
			var possibleToEvolve = false;
			var evolving = false;
			var evolingCells = [];

			var bloodCellFrameCount = 0;
			var evolvingFrameCount = 0;
			var evolvingGroupFrameTime = 50;
			var evolvingFlashFrameTime = 70;

			var flashRadius = 0;

			var money = 0;

			var evolveCellsPublic;

			$("#game").click(function(e) {
				if (!evolving) {
					var selection = selectCell(e.pageX, e.pageY);
					if (selection) {
						currentPlayer.player = false;
						selection.player = true;
						currentPlayer = selection;
					}
				}
			});

			$("#playerSpeedButton").click(function() {
				if (playerSpeed < 5.8 && money >= playerSpeedPrice) {
					money -= playerSpeedPrice;
					playerSpeed += 0.1;
					playerSpeedPrice *= 2;
					$("#playerSpeedLevel").text(Math.round((playerSpeed * 10) - 9));
					$("#playerSpeedPrice").text(shortenMoney(playerSpeedPrice));
					updateMoney ();
				}
			});

			$("#roamingSpeedButton").click(function() {
				if (roamingSpeed < 5.8 && money >= roamingSpeedPrice) {
					money -= roamingSpeedPrice;
					roamingSpeed += 0.1;
					roamingSpeedPrice *= 2;
					$("#roamingSpeedLevel").text(Math.round((roamingSpeed * 10) - 9));
					$("#roamingSpeedPrice").text(shortenMoney(roamingSpeedPrice));
					updateMoney ();
				}
			});

			$("#spawnRateButton").click(function() {
				if (bloodCellSpawnSpeed > 1 && money >= spawnRatePrice) {
					money -= spawnRatePrice;
					bloodCellSpawnSpeed -= 1;
					spawnRatePrice *= 2;
					$("#spawnRateLevel").text(101 - bloodCellSpawnSpeed);
					$("#spawnRatePrice").text(shortenMoney(spawnRatePrice));
					updateMoney ();
				}
			});

			$("#bloodCellValueButton").click(function() {
				if (bloodCellValue < 100 && money >= bloodCellValuePrice) {
					money -= bloodCellValuePrice;
					bloodCellValue += 1;
					bloodCellValuePrice *= 2
					$("#bloodCellValueLevel").text(bloodCellValue);
					$("#bloodCellValuePrice").text(shortenMoney(bloodCellValuePrice));
					updateMoney ();
				}
			});

			$("#bloodCellCountButton").click(function() {
				if (maxBloodCells < 100 && money >= maxBloodCellsPrice) {
					money -= maxBloodCellsPrice;
					maxBloodCells += 1;
					maxBloodCellsPrice *= 2;
					$("#bloodCellCountLevel").text(maxBloodCells);
					$("#bloodCellCountPrice").text(shortenMoney(maxBloodCellsPrice));
					updateMoney ();
				}
			});

			$("#addMoney").click(function() {
				money += 10000000000000000000000000000000000;
				updateMoney ();

			});

			$(".cell-btn").click(function(cell) {
				buyCancerCell ($(this).val());
			});

			$("#evolve").click(function(cell) {
				evolve(evolvingCells);
			});

			setInterval(function() {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				canEvolve();

				if (evolving) {
					if (evolvingFrameCount < evolvingFrameTime)
						evolvingFrameCount++;
					else {
						evolving = false;
						finishedEvolve ();
						evolvingFrameCount = 0;
					}
				}
				var evolveCells = canEvolve();

				if (bloodCells.length === 0) {
					addBloodCell("red");
				}

				if (bloodCellFrameCount > bloodCellSpawnSpeed && bloodCells.length < maxBloodCells) {
					addBloodCell("red");
					bloodCellFrameCount = 0;
				}

				else {
					bloodCellFrameCount++;
				}

				var collisions = [];

				bloodCells.forEach(function(cell, i) {
					cancerCells.forEach(function(cancercell) {
						if(collideCell(cell, cancercell)) {
							deleteBloodCell (i);
							money += bloodCellValue;
							updateMoney ();
							return;
						}
					});

					var collision = [];

					if (collideRightEdge(cell) || collideLeftEdge(cell)) {
						cell.dx = -cell.dx;
					}

					if (collideBottomEdge(cell) || collideTopEdge(cell)) {
						cell.dy = -cell.dy;
					}

					// collision = selectCell(cell);
						
					if (collision[0]) {
						collision[0].dx = -collision[0].dx;
						collision[0].dy = -collision[0].dy;
						cell.dx = -cell.dxc
						cell.dy = -cell.dy;
					}

					drawCell(cell);
					// drawCollider(cell);

					cell.x += cell.dx;
					cell.y += cell.dy;
				});
				
				cancerCells.forEach(function(cell, i) {
					if (cell.player) {
						var speed = 10;
						
						if (leftPressed && !collideLeftEdge(cell)) {
							cell.x -= speed * playerSpeed;
						}

						if (rightPressed && !collideRightEdge(cell)) {
							cell.x += speed * playerSpeed;
						}

						if (downPressed && !collideBottomEdge(cell)) {
							cell.y += speed * playerSpeed;
						}

						if (upPressed && !collideTopEdge(cell)) {
							cell.y -= speed * playerSpeed;
						}

						drawCell(cell);
						// drawCollider(cell);
					}
					else {
						var collision = [];

					if (collideRightEdge(cell) || collideLeftEdge(cell)) {
						cell.dx = -cell.dx;
					}

					if (collideBottomEdge(cell) || collideTopEdge(cell)) {
						cell.dy = -cell.dy;
					}

					// collision = selectCell(cell);
						
					if (collision[0]) {
						collision[0].dx = -collision[0].dx;
						collision[0].dy = -collision[0].dy;
						cell.dx = -cell.dxc
						cell.dy = -cell.dy;
					}

					drawCell(cell);
					// drawCollider(cell);

					cell.x += cell.dx * roamingSpeed;
					cell.y += cell.dy * roamingSpeed;
					}
				});
				if (evolving) {
					if (evolvingFrameCount < evolvingGroupFrameTime) {
						evolvingFrameCount++;
					} 
					else if (evolvingFrameCount < evolvingFlashFrameTime){
						flash ();
						evolvingFrameCount++;
					}
					else {
						evolving = false;
						evolvingFrameCount = 0;
						flashRadius = 0;
					}
				}
			}, 100);
		});
