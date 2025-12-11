import pygame
import math
import sys

pygame.init()
WIDTH = HEIGHT = 400
FPS = 30

# Colors
GRAY, WHITE, BLACK = (80, 80, 80), (255, 255, 255), (0, 0, 0)
DODGER_BLUE, CRIMSON = (30, 144, 255), (220, 20, 60)
LIGHT_BLUE, ORANGE = (173, 216, 230), (255, 165, 0)
GREEN, RED, YELLOW, CYAN = (0, 255, 0), (255, 0, 0), (255, 255, 0), (0, 255, 255)

class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        pygame.display.set_caption("Sword Battle")
        self.clock = pygame.time.Clock()
        self.fonts = {
            'lg': pygame.font.Font(None, 40),
            'md': pygame.font.Font(None, 30),
            'sm': pygame.font.Font(None, 20),
            'xs': pygame.font.Font(None, 16),
            'xxs': pygame.font.Font(None, 12)
        }
        self.reset_game()
    
    def reset_game(self):
        self.state = 'start'
        self.weapon1 = self.weapon2 = 'sword'
        self.ability1 = self.ability2 = None
        self.weapon_stats = {
            'sword': {'length': 50, 'width': 12, 'speed': 10},
            'spear': {'length': 95, 'width': 10, 'speed': 8}
        }
        
        # Player 1
        self.p1 = {
            'x': 100, 'y': 200, 'r': 25, 'vx': 0, 'vy': 0, 'speed': 5.5,
            'angle': 0, 'rot_speed': 0, 'hp': 100, 'mult': 1.0,
            'impact_cd': 0, 'white': 0, 'shield_act': 0, 'shield_cd': 0,
            'boost_act': 0, 'boost_cd': 0, 'chase_cd': 0, 'flee_cd': 0,
            'dash_act': 0, 'dash_cd': 0, 'dash_dmg': False,
            'm1x': None, 'm1y': None, 'm1cd': 0,
            'm2x': None, 'm2y': None, 'm2cd': 0
        }
        
        # Player 2
        self.p2 = {
            'x': 300, 'y': 200, 'r': 25, 'vx': 0, 'vy': 0, 'speed': 5.5,
            'angle': 0, 'rot_speed': 0, 'hp': 100, 'mult': 1.0,
            'impact_cd': 0, 'white': 0, 'shield_act': 0, 'shield_cd': 0,
            'boost_act': 0, 'boost_cd': 0, 'chase_cd': 0, 'flee_cd': 0,
            'dash_act': 0, 'dash_cd': 0, 'dash_dmg': False,
            'm1x': None, 'm1y': None, 'm1cd': 0,
            'm2x': None, 'm2y': None, 'm2cd': 0
        }
        
        self.slow_timer = self.sword_cd = 0
        self.started = False
        self.winner = None
        self.s1x = self.s1y = self.s2x = self.s2y = 0
    
    def txt(self, text, x, y, font_key, color, bold=False):
        f = self.fonts[font_key]
        if bold: f.set_bold(True)
        surf = f.render(str(text), True, color)
        if bold: f.set_bold(False)
        self.screen.blit(surf, surf.get_rect(center=(x, y)))
    
    def draw_start(self):
        self.screen.fill(GRAY)
        self.txt('SWORD BATTLE', 200, 150, 'lg', WHITE, True)
        self.txt('Press SPACE to start', 200, 220, 'sm', WHITE)
    
    def draw_weapon_select(self):
        self.screen.fill(GRAY)
        self.txt('SELECT WEAPONS', 200, 50, 'md', WHITE, True)
        self.txt('PLAYER 1 (Blue)', 100, 120, 'xs', DODGER_BLUE, True)
        self.txt('PLAYER 2 (Red)', 300, 120, 'xs', CRIMSON, True)
        
        for i, (w, y) in enumerate([('sword', 160), ('spear', 230)]):
            b1 = 4 if self.weapon1 == w else 2
            pygame.draw.rect(self.screen, LIGHT_BLUE, (50, y, 100, 50))
            pygame.draw.rect(self.screen, WHITE, (50, y, 100, 50), b1)
            self.txt(w.upper(), 100, y+25, 'xs', BLACK, True)
            
            b2 = 4 if self.weapon2 == w else 2
            pygame.draw.rect(self.screen, ORANGE, (250, y, 100, 50))
            pygame.draw.rect(self.screen, WHITE, (250, y, 100, 50), b2)
            self.txt(w.upper(), 300, y+25, 'xs', BLACK, True)
        
        pygame.draw.rect(self.screen, GREEN, (150, 320, 100, 40))
        pygame.draw.rect(self.screen, WHITE, (150, 320, 100, 40), 2)
        self.txt('NEXT', 200, 340, 'xs', WHITE, True)
    
    def draw_ability_select(self):
        self.screen.fill(GRAY)
        self.txt('SELECT ABILITIES', 200, 20, 'md', WHITE, True)
        self.txt('PLAYER 1', 100, 55, 'xs', DODGER_BLUE, True)
        self.txt('PLAYER 2', 300, 55, 'xs', CRIMSON, True)
        
        abilities = [
            ('shield', 'REFLECT', 'Block'),
            ('boost', 'BOOST', '2x Speed'),
            ('reverse', 'CHASE/FLEE', 'Move'),
            ('dash', 'DASH', 'Ram'),
            ('mark', 'MARK', 'Teleport')
        ]
        
        for i, (ab, nm, desc) in enumerate(abilities):
            y = 75 + i * 47
            for px, py, a, col in [(30, 100, self.ability1, LIGHT_BLUE), (230, 300, self.ability2, ORANGE)]:
                b = 4 if a == ab else 2
                pygame.draw.rect(self.screen, col, (px, y, 140, 42))
                pygame.draw.rect(self.screen, WHITE, (px, y, 140, 42), b)
                self.txt(nm, py, y+12, 'xxs', BLACK, True)
                self.txt(desc, py, y+27, 'xxs', BLACK)
        
        if self.ability1 and self.ability2:
            pygame.draw.rect(self.screen, GREEN, (150, 330, 100, 40))
            pygame.draw.rect(self.screen, WHITE, (150, 330, 100, 40), 2)
            self.txt('START', 200, 350, 'xs', WHITE, True)
    
    def draw_game(self):
        self.screen.fill(GRAY)
        
        if self.slow_timer > 0:
            s = pygame.Surface((WIDTH, HEIGHT))
            s.set_alpha(15)
            s.fill(WHITE)
            self.screen.blit(s, (0, 0))
        
        self.txt(self.weapon1.upper(), 70, 20, 'xs', DODGER_BLUE, True)
        self.txt(self.weapon2.upper(), 330, 20, 'xs', CRIMSON, True)
        
        # Marks
        for p, col in [(self.p1, DODGER_BLUE), (self.p2, CRIMSON)]:
            if p['m1x']:
                pygame.draw.circle(self.screen, col, (int(p['m1x']), int(p['m1y'])), 8)
            if p['m2x']:
                pygame.draw.circle(self.screen, col, (int(p['m2x']), int(p['m2y'])), 8)
        
        # Players
        c1 = WHITE if self.p1['white'] > 0 else DODGER_BLUE
        c2 = WHITE if self.p2['white'] > 0 else CRIMSON
        pygame.draw.circle(self.screen, c1, (int(self.p1['x']), int(self.p1['y'])), self.p1['r'])
        pygame.draw.circle(self.screen, c2, (int(self.p2['x']), int(self.p2['y'])), self.p2['r'])
        
        # Effects
        if self.p1['shield_act'] > 0:
            pygame.draw.circle(self.screen, YELLOW, (int(self.p1['x']), int(self.p1['y'])), self.p1['r']+8, 4)
        if self.p2['shield_act'] > 0:
            pygame.draw.circle(self.screen, YELLOW, (int(self.p2['x']), int(self.p2['y'])), self.p2['r']+8, 4)
        if self.p1['boost_act'] > 0:
            pygame.draw.circle(self.screen, CYAN, (int(self.p1['x']), int(self.p1['y'])), self.p1['r']+5, 3)
        if self.p2['boost_act'] > 0:
            pygame.draw.circle(self.screen, CYAN, (int(self.p2['x']), int(self.p2['y'])), self.p2['r']+5, 3)
        if self.p1['dash_act'] > 0:
            pygame.draw.circle(self.screen, RED, (int(self.p1['x']), int(self.p1['y'])), self.p1['r']+8, 4)
        if self.p2['dash_act'] > 0:
            pygame.draw.circle(self.screen, RED, (int(self.p2['x']), int(self.p2['y'])), self.p2['r']+8, 4)
        
        # Swords
        self.draw_rot_rect(self.s1x, self.s1y, self.weapon_stats[self.weapon1]['width'],
                          self.weapon_stats[self.weapon1]['length'], self.p1['angle']+90, LIGHT_BLUE)
        self.draw_rot_rect(self.s2x, self.s2y, self.weapon_stats[self.weapon2]['width'],
                          self.weapon_stats[self.weapon2]['length'], self.p2['angle']+90, ORANGE)
        
        # HP
        self.txt(max(0, self.p1['hp']), self.p1['x'], self.p1['y'], 'xs', BLACK, True)
        self.txt(max(0, self.p2['hp']), self.p2['x'], self.p2['y'], 'xs', BLACK, True)
        
        # Multipliers
        pygame.draw.rect(self.screen, BLACK, (5, 365, 80, 30))
        pygame.draw.rect(self.screen, DODGER_BLUE, (5, 365, 80, 30), 2)
        self.txt(f"x{self.p1['mult']:.2f}", 45, 380, 'sm', YELLOW, True)
        
        pygame.draw.rect(self.screen, BLACK, (315, 365, 80, 30))
        pygame.draw.rect(self.screen, CRIMSON, (315, 365, 80, 30), 2)
        self.txt(f"x{self.p2['mult']:.2f}", 355, 380, 'sm', YELLOW, True)
        
        # Winner
        if self.winner:
            s = pygame.Surface((WIDTH, HEIGHT))
            s.set_alpha(128)
            s.fill(BLACK)
            self.screen.blit(s, (0, 0))
            wt = 'PLAYER 1 WINS!' if self.winner == 1 else 'PLAYER 2 WINS!'
            wc = DODGER_BLUE if self.winner == 1 else CRIMSON
            self.txt(wt, 200, 200, 'md', wc, True)
    
    def draw_rot_rect(self, x, y, w, h, ang, col):
        s = pygame.Surface((w, h), pygame.SRCALPHA)
        s.fill(col)
        r = pygame.transform.rotate(s, -ang)
        self.screen.blit(r, r.get_rect(center=(x, y)))
    
    def handle_mouse(self, x, y):
        if self.state == 'weaponSelect':
            if 50 <= x <= 150:
                if 160 <= y <= 210: self.weapon1 = 'sword'
                elif 230 <= y <= 280: self.weapon1 = 'spear'
            if 250 <= x <= 350:
                if 160 <= y <= 210: self.weapon2 = 'sword'
                elif 230 <= y <= 280: self.weapon2 = 'spear'
            if 150 <= x <= 250 and 320 <= y <= 360:
                self.state = 'abilitySelect'
        
        elif self.state == 'abilitySelect':
            abs = ['shield', 'boost', 'reverse', 'dash', 'mark']
            if 30 <= x <= 170:
                for i, a in enumerate(abs):
                    if 75+i*47 <= y <= 117+i*47: self.ability1 = a
            if 230 <= x <= 370:
                for i, a in enumerate(abs):
                    if 75+i*47 <= y <= 117+i*47: self.ability2 = a
            if self.ability1 and self.ability2 and 150 <= x <= 250 and 330 <= y <= 370:
                self.start_game()
    
    def start_game(self):
        self.state = 'playing'
        self.p1['rot_speed'] = self.weapon_stats[self.weapon1]['speed']
        self.p2['rot_speed'] = self.weapon_stats[self.weapon2]['speed']
    
    def handle_key(self, key):
        if self.state == 'start' and key == pygame.K_SPACE:
            self.state = 'weaponSelect'
        elif self.state == 'playing' and not self.winner:
            if not self.started:
                self.p1['vx'], self.p1['vy'] = 2, 3.5
                self.p2['vx'], self.p2['vy'] = -2.5, 3
                self.started = True
            
            if key == pygame.K_q: self.use_ab1(True)
            elif key == pygame.K_e: self.use_ab1(False)
            elif key == pygame.K_i: self.use_ab2(True)
            elif key == pygame.K_p: self.use_ab2(False)
    
    def use_ab1(self, primary):
        p = self.p1
        if primary:
            if self.ability1 == 'shield' and p['shield_cd'] == 0:
                p['shield_act'], p['shield_cd'] = 18, int(240/p['mult'])
            elif self.ability1 == 'boost' and p['boost_cd'] == 0:
                p['boost_act'], p['boost_cd'] = 75, int(210/p['mult'])
            elif self.ability1 == 'dash' and p['dash_cd'] == 0:
                p['dash_act'], p['dash_cd'], p['dash_dmg'] = 15, int(180/p['mult']), True
            elif self.ability1 == 'reverse' and p['chase_cd'] == 0:
                dx, dy = self.p2['x']-p['x'], self.p2['y']-p['y']
                m = math.sqrt(dx*dx+dy*dy)
                if m > 0: p['vx'], p['vy'] = (dx/m)*p['speed'], (dy/m)*p['speed']
                p['chase_cd'] = int(75/p['mult'])
            elif self.ability1 == 'mark':
                if p['m1x'] is None and p['m1cd'] == 0:
                    p['m1x'], p['m1y'] = p['x'], p['y']
                elif p['m1x']:
                    dx, dy = p['m1x']-p['x'], p['m1y']-p['y']
                    m = math.sqrt(dx*dx+dy*dy)
                    if m > 0: p['vx'], p['vy'] = (dx/m)*p['speed'], (dy/m)*p['speed']
                    p['m1x'], p['m1y'], p['m1cd'] = None, None, int(150/p['mult'])
        else:
            if self.ability1 == 'reverse' and p['flee_cd'] == 0:
                dx, dy = p['x']-self.p2['x'], p['y']-self.p2['y']
                m = math.sqrt(dx*dx+dy*dy)
                if m > 0: p['vx'], p['vy'] = (dx/m)*p['speed'], (dy/m)*p['speed']
                p['flee_cd'] = int(75/p['mult'])
            elif self.ability1 == 'mark':
                if p['m2x'] is None and p['m2cd'] == 0:
                    p['m2x'], p['m2y'] = p['x'], p['y']
                elif p['m2x']:
                    dx, dy = p['m2x']-p['x'], p['m2y']-p['y']
                    m = math.sqrt(dx*dx+dy*dy)
                    if m > 0: p['vx'], p['vy'] = (dx/m)*p['speed'], (dy/m)*p['speed']
                    p['m2x'], p['m2y'], p['m2cd'] = None, None, int(150/p['mult'])
    
    def use_ab2(self, primary):
        p = self.p2
        if primary:
            if self.ability2 == 'shield' and p['shield_cd'] == 0:
                p['shield_act'], p['shield_cd'] = 18, int(240/p['mult'])
            elif self.ability2 == 'boost' and p['boost_cd'] == 0:
                p['boost_act'], p['boost_cd'] = 75, int(210/p['mult'])
            elif self.ability2 == 'dash' and p['dash_cd'] == 0:
                p['dash_act'], p['dash_cd'], p['dash_dmg'] = 15, int(180/p['mult']), True
            elif self.ability2 == 'reverse' and p['chase_cd'] == 0:
                dx, dy = self.p1['x']-p['x'], self.p1['y']-p['y']
                m = math.sqrt(dx*dx+dy*dy)
                if m > 0: p['vx'], p['vy'] = (dx/m)*p['speed'], (dy/m)*p['speed']
                p['chase_cd'] = int(75/p['mult'])
            elif self.ability2 == 'mark':
                if p['m1x'] is None and p['m1cd'] == 0:
                    p['m1x'], p['m1y'] = p['x'], p['y']
                elif p['m1x']:
                    dx, dy = p['m1x']-p['x'], p['m1y']-p['y']
                    m = math.sqrt(dx*dx+dy*dy)
                    if m > 0: p['vx'], p['vy'] = (dx/m)*p['speed'], (dy/m)*p['speed']
                    p['m1x'], p['m1y'], p['m1cd'] = None, None, int(150/p['mult'])
        else:
            if self.ability2 == 'reverse' and p['flee_cd'] == 0:
                dx, dy = p['x']-self.p1['x'], p['y']-self.p1['y']
                m = math.sqrt(dx*dx+dy*dy)
                if m > 0: p['vx'], p['vy'] = (dx/m)*p['speed'], (dy/m)*p['speed']
                p['flee_cd'] = int(75/p['mult'])
            elif self.ability2 == 'mark':
                if p['m2x'] is None and p['m2cd'] == 0:
                    p['m2x'], p['m2y'] = p['x'], p['y']
                elif p['m2x']:
                    dx, dy = p['m2x']-p['x'], p['m2y']-p['y']
                    m = math.sqrt(dx*dx+dy*dy)
                    if m > 0: p['vx'], p['vy'] = (dx/m)*p['speed'], (dy/m)*p['speed']
                    p['m2x'], p['m2y'], p['m2cd'] = None, None, int(150/p['mult'])
    
    def update(self):
        if self.state != 'playing' or self.winner: return
        
        sf = 0.5 if self.slow_timer > 0 else 1.0
        self.slow_timer = max(0, self.slow_timer-1)
        
        for p in [self.p1, self.p2]:
            for k in ['white', 'impact_cd', 'shield_act', 'shield_cd', 'boost_act',
                     'boost_cd', 'chase_cd', 'flee_cd', 'dash_act', 'dash_cd',
                     'm1cd', 'm2cd']:
                p[k] = max(0, p[k]-1)
        
        self.sword_cd = max(0, self.sword_cd-1)
        
        # Movement
        for p in [self.p1, self.p2]:
            spd = p['speed']
            if p['boost_act'] > 0: spd *= 2
            if p['dash_act'] > 0: spd *= 3
            
            mag = math.sqrt(p['vx']*p['vx']+p['vy']*p['vy'])
            if mag > 0:
                p['vx'], p['vy'] = (p['vx']/mag)*spd, (p['vy']/mag)*spd
            
            p['x'] += p['vx']*sf
            p['y'] += p['vy']*sf
            
            # Walls
            if p['y']+p['r'] >= 400: p['y'], p['vy'] = 400-p['r'], -abs(p['vy'])
            if p['y']-p['r'] <= 0: p['y'], p['vy'] = p['r'], abs(p['vy'])
            if p['x']+p['r'] >= 400: p['x'], p['vx'] = 400-p['r'], -abs(p['vx'])
            if p['x']-p['r'] <= 0: p['x'], p['vx'] = p['r'], abs(p['vx'])
            
            # Rotation
            ws = self.weapon_stats[self.weapon1 if p == self.p1 else self.weapon2]['speed']
            br = ws if p['rot_speed'] > 0 else -ws
            p['angle'] += (br*2 if p['boost_act'] > 0 else br)*sf
        
        # Swords
        for p, w, sw in [(self.p1, self.weapon1, 's1'), (self.p2, self.weapon2, 's2')]:
            wl = self.weapon_stats[w]['length']
            sx = p['x'] + p['r']*math.cos(math.radians(p['angle']))
            sy = p['y'] + p['r']*math.sin(math.radians(p['angle']))
            cx = sx + (wl/2)*math.cos(math.radians(p['angle']))
            cy = sy + (wl/2)*math.sin(math.radians(p['angle']))
            if sw == 's1': self.s1x, self.s1y = cx, cy
            else: self.s2x, self.s2y = cx, cy
        
        # Ball collision
        dx = self.p2['x']-self.p1['x']
        dy = self.p2['y']-self.p1['y']
        dist = math.sqrt(dx*dx+dy*dy)
        md = self.p1['r']+self.p2['r']
        
        if dist < md and dist > 0:
            if self.p1['dash_act'] > 0 and self.p1['dash_dmg']:
                self.p2['hp'] -= int(5*self.p1['mult'])
                self.p2['white'] = 10
                self.p1['dash_dmg'] = False
            if self.p2['dash_act'] > 0 and self.p2['dash_dmg']:
                self.p1['hp'] -= int(5*self.p2['mult'])
                self.p1['white'] = 10
                self.p2['dash_dmg'] = False
            
            ov = md-dist+2
            nx, ny = dx/dist, dy/dist
            self.p1['x'] -= ov*nx*0.5
            self.p1['y'] -= ov*ny*0.5
            self.p2['x'] += ov*nx*0.5
            self.p2['y'] += ov*ny*0.5
            
            d1 = self.p1['vx']*nx + self.p1['vy']*ny
            if d1 > 0:
                self.p1['vx'] -= 2*d1*nx
                self.p1['vy'] -= 2*d1*ny
            
            d2 = self.p2['vx']*(-nx) + self.p2['vy']*(-ny)
            if d2 > 0:
                self.p2['vx'] += 2*d2*nx
                self.p2['vy'] += 2*d2*ny
        
        # Win condition
        if self.p1['hp'] <= 0: self.p1['hp'], self.winner = 0, 2
        elif self.p2['hp'] <= 0: self.p2['hp'], self.winner = 0, 1
    
    def run(self):
        running = True
        while running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                elif event.type == pygame.KEYDOWN:
                    self.handle_key(event.key)
                elif event.type == pygame.MOUSEBUTTONDOWN:
                    self.handle_mouse(*event.pos)
            
            self.update()
            
            if self.state == 'start': self.draw_start()
            elif self.state == 'weaponSelect': self.draw_weapon_select()
            elif self.state == 'abilitySelect': self.draw_ability_select()
            elif self.state == 'playing': self.draw_game()
            
            pygame.display.flip()
            self.clock.tick(FPS)
        
        pygame.quit()

if __name__ == '__main__':
    Game().run()