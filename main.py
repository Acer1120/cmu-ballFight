from cmu_graphics import *
import math

def onAppStart(app):
    app.width = app.height = 400
    app.background = rgb(80, 80, 80)
    app.gameState = 'start'
    app.weapon1 = app.weapon2 = 'sword'
    app.ability1 = app.ability2 = None
    app.weaponStats = {
        'sword': {'length': 50, 'width': 12, 'speed': 10},
        'spear': {'length': 95, 'width': 10, 'speed': 8}
    }
    
    # Player 1
    app.ball1X, app.ball1Y = 100, 200
    app.ball1Radius = 25
    app.ball1VelX = app.ball1VelY = 0
    app.ball1Speed = 5.5
    app.angle1 = app.rotationSpeed1 = 0
    app.hp1 = 100
    app.totalMultiplier1 = 1.0
    app.impactCooldown1 = app.ball1White = 0
    app.shield1Active = app.shield1Cooldown = 0
    app.boost1Active = app.boost1Cooldown = 0
    app.chase1Cooldown = app.flee1Cooldown = 0
    app.dash1Active = app.dash1Cooldown = 0
    app.dash1CanDamage = False
    app.mark1_1X = app.mark1_1Y = None
    app.mark1_1Cooldown = 0
    app.mark1_2X = app.mark1_2Y = None
    app.mark1_2Cooldown = 0
    
    # Player 2
    app.ball2X, app.ball2Y = 300, 200
    app.ball2Radius = 25
    app.ball2VelX = app.ball2VelY = 0
    app.ball2Speed = 5.5
    app.angle2 = app.rotationSpeed2 = 0
    app.hp2 = 100
    app.totalMultiplier2 = 1.0
    app.impactCooldown2 = app.ball2White = 0
    app.shield2Active = app.shield2Cooldown = 0
    app.boost2Active = app.boost2Cooldown = 0
    app.chase2Cooldown = app.flee2Cooldown = 0
    app.dash2Active = app.dash2Cooldown = 0
    app.dash2CanDamage = False
    app.mark2_1X = app.mark2_1Y = None
    app.mark2_1Cooldown = 0
    app.mark2_2X = app.mark2_2Y = None
    app.mark2_2Cooldown = 0
    
    # Game state
    app.slowMotionTimer = app.swordCollisionCooldown = 0
    app.gameStarted = False
    app.winner = None
    app.sword1X = app.sword1Y = app.sword2X = app.sword2Y = 0

def redrawAll(app):
    if app.gameState == 'start':
        drawStartScreen(app)
    elif app.gameState == 'weaponSelect':
        drawWeaponSelect(app)
    elif app.gameState == 'abilitySelect':
        drawAbilitySelect(app)
    elif app.gameState == 'playing':
        drawGame(app)

def drawStartScreen(app):
    drawLabel('SWORD BATTLE', 200, 150, size=40, fill='white', bold=True)
    drawLabel('Press SPACE to start', 200, 220, size=20, fill='white')

def drawWeaponSelect(app):
    drawLabel('SELECT WEAPONS', 200, 50, size=30, fill='white', bold=True)
    drawLabel('PLAYER 1 (Blue)', 100, 120, size=18, fill='dodgerBlue', bold=True)
    drawLabel('PLAYER 2 (Red)', 300, 120, size=18, fill='crimson', bold=True)
    
    drawRect(50, 160, 100, 50, fill='lightBlue', border='white', 
             borderWidth=4 if app.weapon1 == 'sword' else 2)
    drawLabel('SWORD', 100, 185, size=16, fill='black', bold=True)
    
    drawRect(50, 230, 100, 50, fill='lightBlue', border='white',
             borderWidth=4 if app.weapon1 == 'spear' else 2)
    drawLabel('SPEAR', 100, 255, size=16, fill='black', bold=True)
    
    drawRect(250, 160, 100, 50, fill='orange', border='white',
             borderWidth=4 if app.weapon2 == 'sword' else 2)
    drawLabel('SWORD', 300, 185, size=16, fill='black', bold=True)
    
    drawRect(250, 230, 100, 50, fill='orange', border='white',
             borderWidth=4 if app.weapon2 == 'spear' else 2)
    drawLabel('SPEAR', 300, 255, size=16, fill='black', bold=True)
    
    drawRect(150, 320, 100, 40, fill='green', border='white', borderWidth=2)
    drawLabel('NEXT', 200, 340, size=18, fill='white', bold=True)

def drawAbilitySelect(app):
    drawLabel('SELECT ABILITIES', 200, 20, size=30, fill='white', bold=True)
    drawLabel('PLAYER 1', 100, 55, size=18, fill='dodgerBlue', bold=True)
    drawLabel('PLAYER 2', 300, 55, size=18, fill='crimson', bold=True)
    
    # Player 1 abilities
    drawRect(30, 75, 140, 42, fill='lightBlue', border='white',
             borderWidth=4 if app.ability1 == 'shield' else 2)
    drawLabel('REFLECT (Q)', 100, 87, size=12, fill='black', bold=True)
    drawLabel('Block & reflect damage', 100, 102, size=8, fill='black')
    
    drawRect(30, 122, 140, 42, fill='lightBlue', border='white',
             borderWidth=4 if app.ability1 == 'boost' else 2)
    drawLabel('BOOST (Q)', 100, 134, size=12, fill='black', bold=True)
    drawLabel('2x Speed 2.5s', 100, 149, size=8, fill='black')
    
    drawRect(30, 169, 140, 42, fill='lightBlue', border='white',
             borderWidth=4 if app.ability1 == 'reverse' else 2)
    drawLabel('CHASE (Q) / FLEE (E)', 100, 181, size=11, fill='black', bold=True)
    drawLabel('Move toward / away', 100, 196, size=8, fill='black')
    
    drawRect(30, 216, 140, 42, fill='lightBlue', border='white',
             borderWidth=4 if app.ability1 == 'dash' else 2)
    drawLabel('DASH (Q)', 100, 228, size=12, fill='black', bold=True)
    drawLabel('3x Speed + ram dmg', 100, 243, size=8, fill='black')
    
    drawRect(30, 263, 140, 42, fill='lightBlue', border='white',
             borderWidth=4 if app.ability1 == 'mark' else 2)
    drawLabel('MARK (Q/E)', 100, 275, size=12, fill='black', bold=True)
    drawLabel('Place & move to marks', 100, 290, size=8, fill='black')
    
    # Player 2 abilities
    drawRect(230, 75, 140, 42, fill='orange', border='white',
             borderWidth=4 if app.ability2 == 'shield' else 2)
    drawLabel('REFLECT (I)', 300, 87, size=12, fill='black', bold=True)
    drawLabel('Block & reflect damage', 300, 102, size=8, fill='black')
    
    drawRect(230, 122, 140, 42, fill='orange', border='white',
             borderWidth=4 if app.ability2 == 'boost' else 2)
    drawLabel('BOOST (I)', 300, 134, size=12, fill='black', bold=True)
    drawLabel('2x Speed 2.5s', 300, 149, size=8, fill='black')
    
    drawRect(230, 169, 140, 42, fill='orange', border='white',
             borderWidth=4 if app.ability2 == 'reverse' else 2)
    drawLabel('CHASE (I) / FLEE (P)', 300, 181, size=11, fill='black', bold=True)
    drawLabel('Move toward / away', 300, 196, size=8, fill='black')
    
    drawRect(230, 216, 140, 42, fill='orange', border='white',
             borderWidth=4 if app.ability2 == 'dash' else 2)
    drawLabel('DASH (I)', 300, 228, size=12, fill='black', bold=True)
    drawLabel('3x Speed + ram dmg', 300, 243, size=8, fill='black')
    
    drawRect(230, 263, 140, 42, fill='orange', border='white',
             borderWidth=4 if app.ability2 == 'mark' else 2)
    drawLabel('MARK (I/P)', 300, 275, size=12, fill='black', bold=True)
    drawLabel('Place & move to marks', 300, 290, size=8, fill='black')
    
    if app.ability1 and app.ability2:
        drawRect(150, 330, 100, 40, fill='green', border='white', borderWidth=2)
        drawLabel('START', 200, 350, size=18, fill='white', bold=True)

def drawGame(app):
    if app.slowMotionTimer > 0:
        drawRect(0, 0, 400, 400, fill='white', opacity=15)
    
    drawLabel(app.weapon1.upper(), 70, 20, size=16, fill='dodgerBlue', bold=True)
    drawLabel(app.weapon2.upper(), 330, 20, size=16, fill='crimson', bold=True)
    
    # Draw marks
    if app.mark1_1X is not None:
        drawCircle(app.mark1_1X, app.mark1_1Y, 8, fill='dodgerBlue', opacity=60)
        drawLabel('Q', app.mark1_1X, app.mark1_1Y, size=10, fill='white', bold=True)
    if app.mark1_2X is not None:
        drawCircle(app.mark1_2X, app.mark1_2Y, 8, fill='dodgerBlue', opacity=60)
        drawLabel('E', app.mark1_2X, app.mark1_2Y, size=10, fill='white', bold=True)
    if app.mark2_1X is not None:
        drawCircle(app.mark2_1X, app.mark2_1Y, 8, fill='crimson', opacity=60)
        drawLabel('I', app.mark2_1X, app.mark2_1Y, size=10, fill='white', bold=True)
    if app.mark2_2X is not None:
        drawCircle(app.mark2_2X, app.mark2_2Y, 8, fill='crimson', opacity=60)
        drawLabel('P', app.mark2_2X, app.mark2_2Y, size=10, fill='white', bold=True)
    
    drawCircle(app.ball1X, app.ball1Y, app.ball1Radius,
               fill='white' if app.ball1White > 0 else 'dodgerBlue')
    drawCircle(app.ball2X, app.ball2Y, app.ball2Radius,
               fill='white' if app.ball2White > 0 else 'crimson')
    
    if app.shield1Active > 0:
        drawCircle(app.ball1X, app.ball1Y, app.ball1Radius + 8,
                   fill=None, border='yellow', borderWidth=4)
    if app.shield2Active > 0:
        drawCircle(app.ball2X, app.ball2Y, app.ball2Radius + 8,
                   fill=None, border='yellow', borderWidth=4)
    
    if app.boost1Active > 0:
        drawCircle(app.ball1X, app.ball1Y, app.ball1Radius + 5,
                   fill=None, border='cyan', borderWidth=3, opacity=50)
    if app.boost2Active > 0:
        drawCircle(app.ball2X, app.ball2Y, app.ball2Radius + 5,
                   fill=None, border='cyan', borderWidth=3, opacity=50)
    
    if app.dash1Active > 0:
        drawCircle(app.ball1X, app.ball1Y, app.ball1Radius + 8,
                   fill=None, border='red', borderWidth=4, opacity=70)
    if app.dash2Active > 0:
        drawCircle(app.ball2X, app.ball2Y, app.ball2Radius + 8,
                   fill=None, border='red', borderWidth=4, opacity=70)
    
    stats1 = app.weaponStats[app.weapon1]
    stats2 = app.weaponStats[app.weapon2]
    
    drawRect(app.sword1X, app.sword1Y, stats1['width'], stats1['length'],
             fill='lightBlue', align='center', rotateAngle=app.angle1 + 90)
    drawRect(app.sword2X, app.sword2Y, stats2['width'], stats2['length'],
             fill='orange', align='center', rotateAngle=app.angle2 + 90)
    
    drawLabel(str(max(0, app.hp1)), app.ball1X, app.ball1Y,
              size=18, fill='black', bold=True)
    drawLabel(str(max(0, app.hp2)), app.ball2X, app.ball2Y,
              size=18, fill='black', bold=True)
    
    drawMultiplierStats(app)
    drawAbilityCooldowns(app)
    
    if app.winner:
        winnerText = 'PLAYER 1 WINS!' if app.winner == 1 else 'PLAYER 2 WINS!'
        winnerColor = 'dodgerBlue' if app.winner == 1 else 'crimson'
        drawRect(0, 0, 400, 400, fill='black', opacity=50)
        drawLabel(winnerText, 200, 200, size=32, fill=winnerColor, bold=True)

def drawMultiplierStats(app):
    startY = 365
    drawRect(5, startY, 80, 30, fill='black', opacity=80,
             border='dodgerBlue', borderWidth=2)
    drawLabel(f'x{app.totalMultiplier1:.2f}', 45, startY + 15,
              size=20, fill='yellow', bold=True)
    
    drawRect(315, startY, 80, 30, fill='black', opacity=80,
             border='crimson', borderWidth=2)
    drawLabel(f'x{app.totalMultiplier2:.2f}', 355, startY + 15,
              size=20, fill='yellow', bold=True)

def drawAbilityCooldowns(app):
    y = 45
    if app.ability1 == 'shield':
        drawRect(10, y, 30, 8, fill='green' if app.shield1Cooldown == 0 else 'red')
        drawLabel('Q', 25, y-8, size=10, fill='white', bold=True)
    elif app.ability1 == 'boost':
        drawRect(10, y, 30, 8, fill='green' if app.boost1Cooldown == 0 else 'red')
        drawLabel('Q', 25, y-8, size=10, fill='white', bold=True)
    elif app.ability1 == 'reverse':
        drawRect(10, y, 15, 8, fill='green' if app.chase1Cooldown == 0 else 'red')
        drawLabel('Q', 17, y-8, size=9, fill='white', bold=True)
        drawRect(27, y, 15, 8, fill='green' if app.flee1Cooldown == 0 else 'red')
        drawLabel('E', 34, y-8, size=9, fill='white', bold=True)
    elif app.ability1 == 'dash':
        drawRect(10, y, 30, 8, fill='green' if app.dash1Cooldown == 0 else 'red')
        drawLabel('Q', 25, y-8, size=10, fill='white', bold=True)
    elif app.ability1 == 'mark':
        drawRect(10, y, 15, 8, fill='green' if app.mark1_1Cooldown == 0 else 'red')
        drawLabel('Q', 17, y-8, size=9, fill='white', bold=True)
        drawRect(27, y, 15, 8, fill='green' if app.mark1_2Cooldown == 0 else 'red')
        drawLabel('E', 34, y-8, size=9, fill='white', bold=True)
    
    if app.ability2 == 'shield':
        drawRect(360, y, 30, 8, fill='green' if app.shield2Cooldown == 0 else 'red')
        drawLabel('I', 375, y-8, size=10, fill='white', bold=True)
    elif app.ability2 == 'boost':
        drawRect(360, y, 30, 8, fill='green' if app.boost2Cooldown == 0 else 'red')
        drawLabel('I', 375, y-8, size=10, fill='white', bold=True)
    elif app.ability2 == 'reverse':
        drawRect(360, y, 15, 8, fill='green' if app.chase2Cooldown == 0 else 'red')
        drawLabel('I', 367, y-8, size=9, fill='white', bold=True)
        drawRect(377, y, 15, 8, fill='green' if app.flee2Cooldown == 0 else 'red')
        drawLabel('P', 384, y-8, size=9, fill='white', bold=True)
    elif app.ability2 == 'dash':
        drawRect(360, y, 30, 8, fill='green' if app.dash2Cooldown == 0 else 'red')
        drawLabel('I', 375, y-8, size=10, fill='white', bold=True)
    elif app.ability2 == 'mark':
        drawRect(360, y, 15, 8, fill='green' if app.mark2_1Cooldown == 0 else 'red')
        drawLabel('I', 367, y-8, size=9, fill='white', bold=True)
        drawRect(377, y, 15, 8, fill='green' if app.mark2_2Cooldown == 0 else 'red')
        drawLabel('P', 384, y-8, size=9, fill='white', bold=True)

def onKeyPress(app, key):
    if app.gameState == 'start' and key == 'space':
        app.gameState = 'weaponSelect'
    elif app.gameState == 'playing' and not app.winner:
        if not app.gameStarted:
            app.ball1VelX, app.ball1VelY = 2, 3.5
            app.ball2VelX, app.ball2VelY = -2.5, 3
            app.gameStarted = True
        
        # Player 1 abilities (Q/E)
        if key == 'q':
            if app.ability1 == 'shield' and app.shield1Cooldown == 0:
                app.shield1Active = 18
                app.shield1Cooldown = int(240 / app.totalMultiplier1)
            elif app.ability1 == 'boost' and app.boost1Cooldown == 0:
                app.boost1Active = 75
                app.boost1Cooldown = int(210 / app.totalMultiplier1)
            elif app.ability1 == 'dash' and app.dash1Cooldown == 0:
                app.dash1Active = 15
                app.dash1Cooldown = int(180 / app.totalMultiplier1)
                app.dash1CanDamage = True
            elif app.ability1 == 'reverse' and app.chase1Cooldown == 0:
                dx = app.ball2X - app.ball1X
                dy = app.ball2Y - app.ball1Y
                mag = math.sqrt(dx*dx + dy*dy)
                if mag > 0:
                    app.ball1VelX = (dx / mag) * app.ball1Speed
                    app.ball1VelY = (dy / mag) * app.ball1Speed
                app.chase1Cooldown = int(75 / app.totalMultiplier1)
            elif app.ability1 == 'mark':
                if app.mark1_1X is None and app.mark1_1Cooldown == 0:
                    app.mark1_1X, app.mark1_1Y = app.ball1X, app.ball1Y
                elif app.mark1_1X is not None:
                    dx = app.mark1_1X - app.ball1X
                    dy = app.mark1_1Y - app.ball1Y
                    mag = math.sqrt(dx*dx + dy*dy)
                    if mag > 0:
                        app.ball1VelX = (dx / mag) * app.ball1Speed
                        app.ball1VelY = (dy / mag) * app.ball1Speed
                    app.mark1_1X, app.mark1_1Y = None, None
                    app.mark1_1Cooldown = int(150 / app.totalMultiplier1)
        
        elif key == 'e':
            if app.ability1 == 'reverse' and app.flee1Cooldown == 0:
                dx = app.ball1X - app.ball2X
                dy = app.ball1Y - app.ball2Y
                mag = math.sqrt(dx*dx + dy*dy)
                if mag > 0:
                    app.ball1VelX = (dx / mag) * app.ball1Speed
                    app.ball1VelY = (dy / mag) * app.ball1Speed
                app.flee1Cooldown = int(75 / app.totalMultiplier1)
            elif app.ability1 == 'mark':
                if app.mark1_2X is None and app.mark1_2Cooldown == 0:
                    app.mark1_2X, app.mark1_2Y = app.ball1X, app.ball1Y
                elif app.mark1_2X is not None:
                    dx = app.mark1_2X - app.ball1X
                    dy = app.mark1_2Y - app.ball1Y
                    mag = math.sqrt(dx*dx + dy*dy)
                    if mag > 0:
                        app.ball1VelX = (dx / mag) * app.ball1Speed
                        app.ball1VelY = (dy / mag) * app.ball1Speed
                    app.mark1_2X, app.mark1_2Y = None, None
                    app.mark1_2Cooldown = int(150 / app.totalMultiplier1)
        
        # Player 2 abilities (I/P)
        if key == 'i':
            if app.ability2 == 'shield' and app.shield2Cooldown == 0:
                app.shield2Active = 18
                app.shield2Cooldown = int(240 / app.totalMultiplier2)
            elif app.ability2 == 'boost' and app.boost2Cooldown == 0:
                app.boost2Active = 75
                app.boost2Cooldown = int(210 / app.totalMultiplier2)
            elif app.ability2 == 'dash' and app.dash2Cooldown == 0:
                app.dash2Active = 15
                app.dash2Cooldown = int(180 / app.totalMultiplier2)
                app.dash2CanDamage = True
            elif app.ability2 == 'reverse' and app.chase2Cooldown == 0:
                dx = app.ball1X - app.ball2X
                dy = app.ball1Y - app.ball2Y
                mag = math.sqrt(dx*dx + dy*dy)
                if mag > 0:
                    app.ball2VelX = (dx / mag) * app.ball2Speed
                    app.ball2VelY = (dy / mag) * app.ball2Speed
                app.chase2Cooldown = int(75 / app.totalMultiplier2)
            elif app.ability2 == 'mark':
                if app.mark2_1X is None and app.mark2_1Cooldown == 0:
                    app.mark2_1X, app.mark2_1Y = app.ball2X, app.ball2Y
                elif app.mark2_1X is not None:
                    dx = app.mark2_1X - app.ball2X
                    dy = app.mark2_1Y - app.ball2Y
                    mag = math.sqrt(dx*dx + dy*dy)
                    if mag > 0:
                        app.ball2VelX = (dx / mag) * app.ball2Speed
                        app.ball2VelY = (dy / mag) * app.ball2Speed
                    app.mark2_1X, app.mark2_1Y = None, None
                    app.mark2_1Cooldown = int(150 / app.totalMultiplier2)
        
        elif key == 'p':
            if app.ability2 == 'reverse' and app.flee2Cooldown == 0:
                dx = app.ball2X - app.ball1X
                dy = app.ball2Y - app.ball1Y
                mag = math.sqrt(dx*dx + dy*dy)
                if mag > 0:
                    app.ball2VelX = (dx / mag) * app.ball2Speed
                    app.ball2VelY = (dy / mag) * app.ball2Speed
                app.flee2Cooldown = int(75 / app.totalMultiplier2)
            elif app.ability2 == 'mark':
                if app.mark2_2X is None and app.mark2_2Cooldown == 0:
                    app.mark2_2X, app.mark2_2Y = app.ball2X, app.ball2Y
                elif app.mark2_2X is not None:
                    dx = app.mark2_2X - app.ball2X
                    dy = app.mark2_2Y - app.ball2Y
                    mag = math.sqrt(dx*dx + dy*dy)
                    if mag > 0:
                        app.ball2VelX = (dx / mag) * app.ball2Speed
                        app.ball2VelY = (dy / mag) * app.ball2Speed
                    app.mark2_2X, app.mark2_2Y = None, None
                    app.mark2_2Cooldown = int(150 / app.totalMultiplier2)

def onMousePress(app, mouseX, mouseY):
    if app.gameState == 'weaponSelect':
        if 50 <= mouseX <= 150:
            if 160 <= mouseY <= 210:
                app.weapon1 = 'sword'
            elif 230 <= mouseY <= 280:
                app.weapon1 = 'spear'
        if 250 <= mouseX <= 350:
            if 160 <= mouseY <= 210:
                app.weapon2 = 'sword'
            elif 230 <= mouseY <= 280:
                app.weapon2 = 'spear'
        if 150 <= mouseX <= 250 and 320 <= mouseY <= 360:
            app.gameState = 'abilitySelect'
    
    elif app.gameState == 'abilitySelect':
        if 30 <= mouseX <= 170:
            if 75 <= mouseY <= 117:
                app.ability1 = 'shield'
            elif 122 <= mouseY <= 164:
                app.ability1 = 'boost'
            elif 169 <= mouseY <= 211:
                app.ability1 = 'reverse'
            elif 216 <= mouseY <= 258:
                app.ability1 = 'dash'
            elif 263 <= mouseY <= 305:
                app.ability1 = 'mark'
        
        if 230 <= mouseX <= 370:
            if 75 <= mouseY <= 117:
                app.ability2 = 'shield'
            elif 122 <= mouseY <= 164:
                app.ability2 = 'boost'
            elif 169 <= mouseY <= 211:
                app.ability2 = 'reverse'
            elif 216 <= mouseY <= 258:
                app.ability2 = 'dash'
            elif 263 <= mouseY <= 305:
                app.ability2 = 'mark'
        
        if app.ability1 and app.ability2:
            if 150 <= mouseX <= 250 and 330 <= mouseY <= 370:
                startGame(app)

def startGame(app):
    app.gameState = 'playing'
    app.rotationSpeed1 = app.weaponStats[app.weapon1]['speed']
    app.rotationSpeed2 = app.weaponStats[app.weapon2]['speed']

def distance(x1, y1, x2, y2):
    return math.sqrt((x2-x1)**2 + (y2-y1)**2)

def normalizeVelocity(velX, velY, speed):
    mag = math.sqrt(velX*velX + velY*velY)
    if mag > 0:
        return (velX / mag) * speed, (velY / mag) * speed
    return velX, velY

def getSwordCenter(ballX, ballY, angle, weaponLength, ballRadius):
    surfaceX = ballX + ballRadius * math.cos(math.radians(angle))
    surfaceY = ballY + ballRadius * math.sin(math.radians(angle))
    centerX = surfaceX + (weaponLength/2) * math.cos(math.radians(angle))
    centerY = surfaceY + (weaponLength/2) * math.sin(math.radians(angle))
    return centerX, centerY

def getSwordTip(ballX, ballY, angle, weaponLength, ballRadius):
    surfaceX = ballX + ballRadius * math.cos(math.radians(angle))
    surfaceY = ballY + ballRadius * math.sin(math.radians(angle))
    tipX = surfaceX + weaponLength * math.cos(math.radians(angle))
    tipY = surfaceY + weaponLength * math.sin(math.radians(angle))
    return tipX, tipY

def checkBallCollision(app):
    dx = app.ball2X - app.ball1X
    dy = app.ball2Y - app.ball1Y
    dist = math.sqrt(dx*dx + dy*dy)
    minDist = app.ball1Radius + app.ball2Radius
    
    if dist < minDist and dist > 0:
        if app.dash1Active > 0 and app.dash1CanDamage:
            damage = int(5 * app.totalMultiplier1)
            app.hp2 -= damage
            app.ball2White = 10
            app.dash1CanDamage = False
        
        if app.dash2Active > 0 and app.dash2CanDamage:
            damage = int(5 * app.totalMultiplier2)
            app.hp1 -= damage
            app.ball1White = 10
            app.dash2CanDamage = False
        
        overlap = minDist - dist + 2
        nx = dx / dist
        ny = dy / dist
        
        app.ball1X -= overlap * nx * 0.5
        app.ball1Y -= overlap * ny * 0.5
        app.ball2X += overlap * nx * 0.5
        app.ball2Y += overlap * ny * 0.5
        
        dot1 = app.ball1VelX * nx + app.ball1VelY * ny
        if dot1 > 0:
            app.ball1VelX -= 2 * dot1 * nx
            app.ball1VelY -= 2 * dot1 * ny
        
        dot2 = app.ball2VelX * (-nx) + app.ball2VelY * (-ny)
        if dot2 > 0:
            app.ball2VelX += 2 * dot2 * nx
            app.ball2VelY += 2 * dot2 * ny
        
        speed1 = app.ball1Speed
        speed2 = app.ball2Speed
        
        if app.boost1Active > 0:
            speed1 *= 2
        if app.boost2Active > 0:
            speed2 *= 2
        if app.dash1Active > 0:
            speed1 *= 3
        if app.dash2Active > 0:
            speed2 *= 3
        
        app.ball1VelX, app.ball1VelY = normalizeVelocity(app.ball1VelX, app.ball1VelY, speed1)
        app.ball2VelX, app.ball2VelY = normalizeVelocity(app.ball2VelX, app.ball2VelY, speed2)

def checkSwordToSwordCollision(sword1X, sword1Y, sword2X, sword2Y):
    return distance(sword1X, sword1Y, sword2X, sword2Y) < 35

def checkSwordHitsBall(app, swordTipX, swordTipY, targetBallX, targetBallY,
                       ownBallX, ownBallY, targetRadius):
    distToTarget = distance(swordTipX, swordTipY, targetBallX, targetBallY)
    distToOwn = distance(swordTipX, swordTipY, ownBallX, ownBallY)
    distBetweenBalls = distance(ownBallX, ownBallY, targetBallX, targetBallY)
    return (distToTarget < (targetRadius + 10) and 
            distToOwn > 30 and distToTarget < distBetweenBalls)

def onStep(app):
    if app.gameState != 'playing' or app.winner:
        return
    
    stats1 = app.weaponStats[app.weapon1]
    stats2 = app.weaponStats[app.weapon2]
    
    slowFactor = 0.5 if app.slowMotionTimer > 0 else 1.0
    
    app.slowMotionTimer = max(0, app.slowMotionTimer - 1)
    app.ball1White = max(0, app.ball1White - 1)
    app.ball2White = max(0, app.ball2White - 1)
    app.impactCooldown1 = max(0, app.impactCooldown1 - 1)
    app.impactCooldown2 = max(0, app.impactCooldown2 - 1)
    app.swordCollisionCooldown = max(0, app.swordCollisionCooldown - 1)
    
    app.shield1Active = max(0, app.shield1Active - 1)
    app.shield1Cooldown = max(0, app.shield1Cooldown - 1)
    app.shield2Active = max(0, app.shield2Active - 1)
    app.shield2Cooldown = max(0, app.shield2Cooldown - 1)
    
    app.boost1Active = max(0, app.boost1Active - 1)
    app.boost1Cooldown = max(0, app.boost1Cooldown - 1)
    app.boost2Active = max(0, app.boost2Active - 1)
    app.boost2Cooldown = max(0, app.boost2Cooldown - 1)
    
    app.chase1Cooldown = max(0, app.chase1Cooldown - 1)
    app.flee1Cooldown = max(0, app.flee1Cooldown - 1)
    app.chase2Cooldown = max(0, app.chase2Cooldown - 1)
    app.flee2Cooldown = max(0, app.flee2Cooldown - 1)
    
    app.dash1Active = max(0, app.dash1Active - 1)
    app.dash1Cooldown = max(0, app.dash1Cooldown - 1)
    app.dash2Active = max(0, app.dash2Active - 1)
    app.dash2Cooldown = max(0, app.dash2Cooldown - 1)
    
    app.mark1_1Cooldown = max(0, app.mark1_1Cooldown - 1)
    app.mark1_2Cooldown = max(0, app.mark1_2Cooldown - 1)
    app.mark2_1Cooldown = max(0, app.mark2_1Cooldown - 1)
    app.mark2_2Cooldown = max(0, app.mark2_2Cooldown - 1)
    
    speed1 = app.ball1Speed
    speed2 = app.ball2Speed
    
    if app.boost1Active > 0:
        speed1 *= 2
    if app.boost2Active > 0:
        speed2 *= 2
    if app.dash1Active > 0:
        speed1 *= 3
    if app.dash2Active > 0:
        speed2 *= 3
    
    baseRot1 = stats1['speed'] if app.rotationSpeed1 > 0 else -stats1['speed']
    baseRot2 = stats2['speed'] if app.rotationSpeed2 > 0 else -stats2['speed']
    curRot1 = baseRot1 * 2 if app.boost1Active > 0 else baseRot1
    curRot2 = baseRot2 * 2 if app.boost2Active > 0 else baseRot2
    
    app.ball1X += app.ball1VelX * slowFactor
    app.ball1Y += app.ball1VelY * slowFactor
    app.ball2X += app.ball2VelX * slowFactor
    app.ball2Y += app.ball2VelY * slowFactor
    
    if app.ball1Y + app.ball1Radius >= 400:
        app.ball1Y = 400 - app.ball1Radius
        app.ball1VelY = -abs(app.ball1VelY)
    if app.ball1Y - app.ball1Radius <= 0:
        app.ball1Y = app.ball1Radius
        app.ball1VelY = abs(app.ball1VelY)
    if app.ball1X + app.ball1Radius >= 400:
        app.ball1X = 400 - app.ball1Radius
        app.ball1VelX = -abs(app.ball1VelX)
    if app.ball1X - app.ball1Radius <= 0:
        app.ball1X = app.ball1Radius
        app.ball1VelX = abs(app.ball1VelX)
    
    if app.ball2Y + app.ball2Radius >= 400:
        app.ball2Y = 400 - app.ball2Radius
        app.ball2VelY = -abs(app.ball2VelY)
    if app.ball2Y - app.ball2Radius <= 0:
        app.ball2Y = app.ball2Radius
        app.ball2VelY = abs(app.ball2VelY)
    if app.ball2X + app.ball2Radius >= 400:
        app.ball2X = 400 - app.ball2Radius
        app.ball2VelX = -abs(app.ball2VelX)
    if app.ball2X - app.ball2Radius <= 0:
        app.ball2X = app.ball2Radius
        app.ball2VelX = abs(app.ball2VelX)
    
    app.ball1VelX, app.ball1VelY = normalizeVelocity(app.ball1VelX, app.ball1VelY, speed1)
    app.ball2VelX, app.ball2VelY = normalizeVelocity(app.ball2VelX, app.ball2VelY, speed2)
    
    app.angle1 += curRot1 * slowFactor
    app.angle2 += curRot2 * slowFactor
    
    app.sword1X, app.sword1Y = getSwordCenter(app.ball1X, app.ball1Y, app.angle1,
                                              stats1['length'], app.ball1Radius)
    app.sword2X, app.sword2Y = getSwordCenter(app.ball2X, app.ball2Y, app.angle2,
                                              stats2['length'], app.ball2Radius)
    
    sword1TipX, sword1TipY = getSwordTip(app.ball1X, app.ball1Y, app.angle1,
                                         stats1['length'], app.ball1Radius)
    sword2TipX, sword2TipY = getSwordTip(app.ball2X, app.ball2Y, app.angle2,
                                         stats2['length'], app.ball2Radius)
    
    checkBallCollision(app)
    
    if (checkSwordToSwordCollision(app.sword1X, app.sword1Y, app.sword2X, app.sword2Y)
        and app.swordCollisionCooldown == 0):
        app.rotationSpeed1 = -app.rotationSpeed1
        app.rotationSpeed2 = -app.rotationSpeed2
        app.swordCollisionCooldown = 20
    
    if (checkSwordHitsBall(app, sword1TipX, sword1TipY, app.ball2X, app.ball2Y,
                           app.ball1X, app.ball1Y, app.ball2Radius)
        and app.impactCooldown1 == 0):
        if app.shield2Active > 0:
            reflectDamage = int(1 * app.totalMultiplier1)
            app.hp1 -= reflectDamage
            app.slowMotionTimer = 25
            app.impactCooldown1 = 25
            app.ball1White = 10
            app.shield2Cooldown = app.shield2Cooldown // 2
            app.shield2Active = 0
        else:
            damage = int(1 * app.totalMultiplier1)
            app.hp2 -= damage
            app.slowMotionTimer = 25
            app.impactCooldown1 = 25
            app.ball2White = 10
            app.ball1Speed += 0.5
            app.rotationSpeed1 += 1.5 if app.rotationSpeed1 > 0 else -1.5
            app.totalMultiplier1 += 0.15
    
    if (checkSwordHitsBall(app, sword2TipX, sword2TipY, app.ball1X, app.ball1Y,
                           app.ball2X, app.ball2Y, app.ball1Radius)
        and app.impactCooldown2 == 0):
        if app.shield1Active > 0:
            reflectDamage = int(1 * app.totalMultiplier2)
            app.hp2 -= reflectDamage
            app.slowMotionTimer = 25
            app.impactCooldown2 = 25
            app.ball2White = 10
            app.shield1Cooldown = app.shield1Cooldown // 2
            app.shield1Active = 0
        else:
            damage = int(1 * app.totalMultiplier2)
            app.hp1 -= damage
            app.slowMotionTimer = 25
            app.impactCooldown2 = 25
            app.ball1White = 10
            app.ball2Speed += 0.5
            app.rotationSpeed2 += 1.5 if app.rotationSpeed2 > 0 else -1.5
            app.totalMultiplier2 += 0.15
    
    if app.hp1 <= 0:
        app.hp1 = 0
        app.winner = 2
    elif app.hp2 <= 0:
        app.hp2 = 0
        app.winner = 1

runApp()