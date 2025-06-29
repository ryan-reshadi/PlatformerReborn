/**
 * @jest-environment jsdom
 */

import * as code from '../../src/index';

var player = new code.Player({ x: 0, y: 0 });

test ('Player should have initial position', () => {
    expect(player.x).toBe(0);
    expect(player.y).toBe(0);
});
test ('Player should be able to move', () => {
    player.move(5);
    expect(player.x).toBe(5);
    // expect(player.y).toBe(10);
});
test ('Correct starting position', () => {
    for (let i = 1; i < 4; i++){
        code.startLevel(i);
        expect(code.platforms.length).toBeGreaterThan(0);
        expect(code.fires.length).toBeGreaterThan(0);
        
    }
});