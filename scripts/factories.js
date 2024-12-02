(()=>{
    function location(x,y,z,yaw,pitch){
        return {
            type: 'location',
            x, y, z, yaw, pitch
        }
    }

    return {
        location, loc: location,
        vector(x,y,z){
            return {
                type: 'vector',
                x, y, z
            }
        },
        potion(potion, amplifier, duration){
            return {
                type: 'potion',
                potion, amplifier, duration
            }
        },
        item(id, name, count, lore, nbt, custom_tags){
            let item = {id, name, count, lore, nbt, custom_tags};
            if(typeof id == 'object') item = {...id};
            return {type: 'item', jmjs: true, item};
        },
        block(id){
            return {
                type: "block",
                block: id
            }
        },
        sound(sound, volume, pitch, variation, source){
            if(typeof sound == 'object') return {type: 'sound', ...sound}
            return {
                type: 'sound',
                sound, volume,
                pitch, variation, source
            }
        },
        particle(particle, count, spread_x, spread_y, spread_z, motion_x, motion_y, motion_z, material, color, size, to_color){
            if(typeof particle == 'object') return {type: 'particle', ...particle}
            return {
                type: 'particle',
                particle, count, to_color,
                spread_x, spread_y, spread_z,
                motion_x, motion_y, motion_z,
                material, color, size
            }
        },
        minimessage(value){
            return {
                type: "minimessage",
                value
            }
        },
        mm(value){
            return {
                type: "minimessage",
                value
            }
        },
        plain(value){
            return {
                type: "plain",
                value
            }
        },
        p(value){
            return {
                type: "plain",
                value
            }
        }
    }
});