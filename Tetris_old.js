window.onresize = function(){
    var game_height = (getComputedStyle(document.getElementById('game')).getPropertyValue('height')).replace('px', '')
    var game_width = game_height * 0.72
    document.getElementById('game').style.setProperty('width', game_width + 'px')

    var cells = document.getElementsByClassName('cells')

    for (var i = 0; i < cells.length; i++) {
        cells[i].id = 'cell_' + i
        cells[i].style.height = cells[i].offsetWidth + 'px'
    }
}

var now
var then = Date.now()
var fps = 24
var fps_interval = 1000 / fps
var free_cell_color = 'rgb(240, 248, 255)'

var game = {
    'game_is_over' : false,
    'game_is_paused' : false,
    'origin_game_speed' : 12,
    'game_speed' : 12,
    'game_time' : 0,
    'current_figure' : [],
    'current_figure_id' : null,
    'cells_color' : [],
    'game_field' : null,
    'key_pressed' : false,
    'shapes': [
        [[9, 3, 0], [10, 4, 0], [11, 5, 0], [12, 6, 0]], 
        [[1, 4, 0], [4, 4, 1], [5, 5, 1], [6, 6, 1]], 
        [[4, 4, 1], [5, 5, 1], [6, 6, 1], [3, 6, 0]], 
        [[1, 4, 0], [2, 5, 0], [3, 4, 1], [4, 5, 1]], 
        [[7, 4, 1], [8, 5, 1], [5, 5, 0], [6, 6, 0]], 
        [[4, 4, 0], [5, 5, 0], [8, 5, 1], [9, 6, 1]], 
        [[7, 4, 1], [8, 5, 1], [9, 6, 1], [5, 5, 0]],
    ],
    'rotation_matrix' : {
        '3' : {
            '1': [[3,2,0],[6,1,1],[9,0,2],
                [2,1,-1],[5,0,0],[8,-1,1],
                [1,0,-2],[4,-1,-1],[7,-2,0]],
            '-1': [[7,0,2],[4,-1,1],[1,-2,0],
                [8,1,1],[5,0,0],[2,-1,-1],
                [9,2,0],[6,1,-1],[3,0,-2]]
        },
        '4' : {
            '1': [[1,0,0],[8,2,1],[12,1,2],[4,0,0],
                [3,2,-1],[7,1,0],[11,0,1],[15,-1,2],
                [2,1,-2],[6,0,-1],[10,-1,0],[14,-2,1],
                [13,0,0],[5,-1,-2],[9,-2,-1],[16,0,0]],
            '-1': [[1,0,0],[9,-1,2],[5,-2,1],[4,0,0],
                [14,1,2],[10,0,1],[6,-1,0],[2,-2,-1],
                [15,2,1],[11,1,0],[7,0,-1],[3,-1,-2],
                [13,0,0],[12,2,-1],[8,1,-2],[16,0,0]]
        },
    },
    'CleanUp' : function(g, r){
        var downfall = false
        for(var i = g.cells_color.length; i > 0; i--){
            downfall = ((i / 10) - (i % 10)) == r ? true : downfall
            if(i > 10){
                g.cells_color[i] = !!downfall ? g.cells_color[i - 10] : g.cells_color[i]
            } else {
                g.cells_color[i] = free_cell_color
            }            
        }
    },
    'GetALine' : function(){
        var row = 0
        var color_streak = 0
        for(var i = 0; i < this.cells_color.length; i++){
            if(!(i % 10)){
                row++
                color_streak = 0
            }

            this.cells_color[i] != free_cell_color ? color_streak++ : null
            color_streak == 10 ? this.CleanUp(this, row) : null
        }
    },
    'cylinder': true,
}

function InitializeField(g){
    var div

    for(var i = 0; i < 200; i++){
        div = document.createElement('div')
        div.className = 'cells'
        document.getElementById('gamefield').appendChild(div)
    }
    
    var cells = document.getElementsByClassName('cells')
    
    for (var i = 0; i < cells.length; i++) {
        cells[i].id = 'cell_' + i
        cells[i].style.height = cells[i].offsetWidth + 'px'
        g.cells_color.push(getComputedStyle(cells[i]).backgroundColor) 
    }

    g.game_field = cells
}

function CheckShape(cs, cc, arg_cc, c, arg_c, s, arg_s){
    var check = true
    cs.forEach(function(e){
        check = !e[cc](arg_cc, arg_c) ? false : check
    })
    if(!!check){
        cs.forEach(function(e){
            !!e[c] ? e[c](arg_c, arg_cc) : null
        })
    } else {
        cs.forEach(function(e){
            !!e[s] ? e[s](arg_s) : null
        })
    }
}

document.addEventListener('keypress', function(event) {
    if(!!game.current_figure && !game.key_pressed && !game.game_is_paused){
        game.key_pressed = true
        switch(event.keyCode){
            case 97:
                CheckShape(game.current_figure, 'CheckStepAside', game, 'StepAside', -1)
            break;
            case 100:
                CheckShape(game.current_figure, 'CheckStepAside', game, 'StepAside', 1)
            break;
            case 115:
                game.game_speed = Math.floor(game.game_speed / 4)
                break;
            // XXX key: E?
            case 113:
                if(game.current_figure_id != 3){
                    CheckShape(game.current_figure, 'CheckRotation', game, 'Rotate', -1)
                }
            break;
            case 101:
                if(game.current_figure_id != 3){
                    CheckShape(game.current_figure, 'CheckRotation', game, 'Rotate', 1)
                }
            break;
        }
    }
    if(event.keyCode == 112) {
        game.key_pressed = true
        game.game_is_paused = !game.game_is_paused ? true : false
    }
})

document.addEventListener('keyup', function(event) {
    if(!!game.key_pressed && !!event.keyCode){
        game.key_pressed = false
        game.game_speed = game.origin_game_speed
    }
})

function GetIndex(a, b){
    return String(a) + String(b)
}

function CreateCell(x, y, color, id){
    this.id = id
    this.x = x
    this.y = y
    this.color = color
    this.getY = function(){
        return !this.y ? '' : this.y
    }

    this.Stop = function(g){
        g.cells_color[GetIndex(this.getY(), this.x)] = this.color
        g.current_figure = []    
    }

    this.CheckFall = function(g){
        if(this.y < 19){
            if(g.cells_color[GetIndex(this.getY() + 1, this.x)] == free_cell_color){
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    }

    this.CheckStepAside = function(g, sign){
        var check = sign > 0 ? this.x < 9 : this.x > 0
        if(check || !!g.cylinder){
            var next_cell = this.x + sign
            if(!!g.cylinder){
                next_cell = next_cell > 9 ? 0 : next_cell < 0 ? 9 : next_cell
            }
            if(g.cells_color[GetIndex(this.getY(), next_cell)] == free_cell_color){
                return true
            }
        } else {
            return false  
        }
    }

    this.CheckMatrixRotation = function(gcc, x, y){
        return (!!gcc[GetIndex(y, x)] && 
        gcc[GetIndex(y, x)] == free_cell_color)
    }

    this.CheckRotation = function(g, sign){
        var size = !g.current_figure_id ? 4 : 3
        var matrix_cell = g.rotation_matrix[size][sign][this.id - 1]
        return this.CheckMatrixRotation(g.cells_color, this.x + matrix_cell[1], this.y + matrix_cell[2])
    }

    this.Rotate = function(sign, g){
        var size = !g.current_figure_id ? 4 : 3
        var matrix_cell = g.rotation_matrix[size][sign][this.id - 1]
        this.id = matrix_cell[0]
        this.x += matrix_cell[1]
        this.y += matrix_cell[2]
    }
    
    this.Fall = function(){
        this.y++
    }

    this.StepAside = function(sign, g){
        this.x = this.x + sign
        if(!!g.cylinder){
            console.log(this.x)
            this.x = this.x > 9 ? 0 : this.x < 0 ? 9 : this.x
        }
    }
}

function CheckGameOver(g, ts){
    ts.forEach(function(e){
        var ind = !e[2] ? e[1] : GetIndex(e[1], e[2])
        g.game_is_over = g.cells_color[ind] != free_cell_color ? true : g.game_is_over
    })
}

function CreateShape(g){
    var shape_ind = Math.floor(Math.random() * g.shapes.length)
    var taken_shape = g.shapes[shape_ind]
    g.current_figure_id = shape_ind
    CheckGameOver(g, taken_shape)
    if(!g.game_is_over){
        var color = GenerateColor()
        for(var i = 0; i < taken_shape.length; i++){
            g.current_figure.push(new CreateCell(taken_shape[i][1], taken_shape[i][2], color, taken_shape[i][0]))
        }
    }
}

function ChannelPicker(){
    return Math.ceil(Math.random() * 200) + 55
}

function GenerateColor(){
    return 'rgb(' + 
        ChannelPicker() + ',' +
        ChannelPicker() + ',' +
        ChannelPicker() + ')'
}

function Update(g){
    if(!g.current_figure.length){
        CreateShape(g)
    } else {
        if(!(game.game_time % game.game_speed)){
            CheckShape(game.current_figure, 'CheckFall', g, 'Fall', null, 'Stop', g)
        }
    }
    g.GetALine()
}

function Draw(g){
    for (var i = 0; i < game.game_field.length; i++) {
        game.game_field[i].style.backgroundColor = g.cells_color[i]
    }
    if(!!g.current_figure.length){
        g.current_figure.forEach(e => {
            document.getElementById('cell_' + e.getY() + e.x).style.backgroundColor = e.color
        })
    }
}

function gameLoop(){
    if(!!game.game_is_over){
        console.log('GAME OVER!')
        return
    }
    window.requestAnimationFrame(gameLoop)
    if(!game.game_is_paused){
        now = Date.now()
        elapsed = now - then
        if (elapsed > fps_interval) {
            then = now - (elapsed % fps)
            Update(game)
            Draw(game)
            game.game_time++
        }
    }
}

InitializeField(game)
gameLoop()


// Описание структуры работы приложения:
//  - Data flow
//  - Control flow
//  - Structure
//  
// 1) Найти имя автора первого фотографического изображения полученного методом совмещения разных исходных данных - Оскар Рейландер, английский художник-живописец-прерафаэлит, 1856, 30 негативов, "The Two Ways of Life" (1857)
// 2) Циллиндрический тетрис DONE
// 3) Дописать Сашин тетрис
// 4) Рассмотреть и описать вопрос описания тетриса с точки зрения описания структуры работы приложения (см. Список выше) KINDA...
// 5) Подумать на тему взаимодействия тетриса с окружающей средой -- как выглядит тетрис, как живой организм и в какой среде он живет? DONE

// 1) Мгновенная реакция на поворот и потактовое движение - DONE
// 2) Написать документацию по тетрису (юзерскую, технологическую и функциональную)
// 3) Дописать Сашин тетрис - 
// 4) Переписать тетрис
