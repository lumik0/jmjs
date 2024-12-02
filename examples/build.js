funs.new = ()=>{
    game['size'] = 0;
    range(l.i, 0, 1000, 1, (i)=>{
        cond(game[`loc_${i}`], '==', 0).then(()=>{
            returnFunction();
        });
        cond('var_exists', true, game[`loc_${i}`]).then(()=>{
            returnFunction();
        });
        game.setBlock(game[`loc_${i}`], true, block('air'));
        event.player.message(game[`loc_${i}`]);
        game[`loc_${i}`] = 0;
    });
}
events.on('player_place_block', (e)=>{
    let p = ph(game['size']);
    game[`loc_${p}`] = gv('event_block_location');
    variable.add(game['size'], game['size'], 1);
});
events.on('player_join', (e)=>{
    e.player.setGamemode('CREATIVE', 'KEEP_ORIGINAL');
    e.player.teleport(loc(14.5,4,1.5,-90,0));
});
events.on('player_move', (e)=>{
    l.pos = gv('event_new_location');
    variable.getCoordinate(l.y, l.pos, 'Y');
    cond(l.y, '>', -10).then(()=>{
        e.player.teleport(loc(14.5,4,1.5,-90,0));
        callF('new');
    });
});
callF('new');