import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// boton 
// componente hijo
// componente de funcion (solo render y sin estado propio)
function Square(props) {
    return (
      // onClick={props.onClick} cada vez que se renderiza se ejecuta 
      <button 
        className="square"
        // convención : on[Evento] = props que representan eventos
        // componente de funcion => sin "this" ni "()""
        // onClick={() => this.props.onClick()}
        onClick={props.onClick}>
        {props.value}
      </button>
    );
  }

  
  // tablero de botones 
  // componente padre 
  class Board extends React.Component {
    // pasa valores a square 
    renderSquare(i) {
      // recibe props de squares y onClick del componente game 
      return (
        <Square
          value={this.props.squares[i]}
          // solo llama a la funcion cuando se hace click           
          onClick={() => this.props.onClick(i)}
        />
      );
    }
    
    // metodo que retorna descripcion de lo 
    // que queres ver en pantalla(elemento de React) 
    render() {
      return (
        // sintaxis JSX
        <div className='container'>
          <table className='board'>
            <tr>
              <td>{this.renderSquare(0)}</td>
              <td>{this.renderSquare(1)}</td>
              <td>{this.renderSquare(2)}</td>
            </tr>
            <tr>
              <td>{this.renderSquare(3)}</td>
              <td>{this.renderSquare(4)}</td>
              <td>{this.renderSquare(5)}</td>
            </tr>
            <tr>
              <td>{this.renderSquare(6)}</td>
              <td>{this.renderSquare(7)}</td>
              <td>{this.renderSquare(8)}</td>
            </tr>
          </table>
        </div>
      );
    }
  }
  
  class Game extends React.Component {
    // Las clases de componentes con constructor 
    // deben empezar con una llamada a super(props).
    constructor(props) {
      super(props);
      // establece estado inicial del juego  
      this.state = {
        // rellena tablero con nulls
        history: [{
          squares: Array(9).fill(null)
        }],
        stepNumber: 0,
        // primer movimiento = "X"
        xIsNext: true,
      };
    }
    
    // convencion: handle[Evento] = métodos que manejan eventos.
    // se activa al hacer click en un cuadrado 
    handleClick(i) {
      // crea copia de array para poder modificarlo.(inmutabilidad)
      // importante para mantener versiones previas y reusarlas , 
      // metodo que facilita detectar un cambio y determinar si se renderiza o no.
      // representa todos los estados del tablero,desde el primero hasta el ultimo
      // esto asegura que si "volvemos al tiempo" y luego hacemos un nuevo movimiento desde 
      // ese punto,tiramos toda la historia "futura" que ahora seria incorrecta
      const history = this.state.history.slice(0,this.state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = current.squares.slice();
      
      // ignora un click si alguien ha ganado o si un cuadrado esta ya rellenado 
      if (calculateWinner(squares) || squares[i]) {
        return;
      }
      // en cada movimiento cambia de jugador
      squares[i] = this.state.xIsNext ? 'X' : 'O';
      this.setState({
        // concat en vez de push para no mutar el array original 
        history: history.concat([{
          squares: squares,
          //Almacenar el índice del último cuadrado movido
          latestMoveSquare: i, 
        }]),
        // verifica numero de pasos 
        // asegura no estancarse mostrando el mismo 
        // movimiento despues de uno nuevo realizado.
        stepNumber: history.length,
        // verifica si juega "x" 
        xIsNext: !this.state.xIsNext,
      });
    }

    // metodo que actualiza stepNumber y xIsNext 
    jumpTo(step){
      this.setState({
        stepNumber: step,
        xIsNext: (step % 2) === 0,
      });
    }
    

    render() {
      const history = this.state.history;
      // renderiza movimiento seleccionado actualmente 
      const current = history[this.state.stepNumber];
      // revisa si un jugador ha ganado 
      const winner = calculateWinner(current.squares);
      
      // mapea historial a elemento de react 
      // representando botones en pantalla y mostrando botones
      // para "saltar" a movimientos anteriores 
      // step = referencia al valor actual de history
      // move = referencia indice del elemento actual de history
      const moves = history.map((step, move) => {
        const latestMoveSquare = step.latestMoveSquare;
        const row = 1 + Math.floor(latestMoveSquare / 3);
        const col = 1 + latestMoveSquare % 3;
        const desc = move ?
        `Ir al movimiento #${move} (${col}, ${row})`:
        'Ir al comienzo del juego';
        return (
          // crea lista por cada movimiento 
          // key:importante para diferenciar cada elemento de la lista
            <li key={move}>
              <button className = {move === this.state.stepNumber ? 'btn btn-light':'btn btn-dark' }
                  onClick={()=> this.jumpTo(move)}>
                    {desc}
                </button>
            </li>
        );
      });
      
      //estado turno, siguiente turno o quien gano el juego
      let status;
      if (winner) {
        status = 'Ganador: ' + winner;
      } else {
        status = 'Proximo jugador: ' + (this.state.xIsNext ? 'J1 (X)' : 'J2 (O)');
      }
  
      return (
        <div className="game">
          <div className="game-board">
            <Board
              squares={current.squares}
              onClick={(i) => this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <div className='h3 text-white'>{status}</div>
            <ol>{moves}</ol>
          </div>
        </div>
      );
    }
  }
  
  // ========================================
  
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<Game />);
  
  function calculateWinner(squares) {
    const lines = [
      // posiciones ganadoras horizontal 
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      // posiciones ganadoras vertical
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      // posiciones ganadoras diagonal
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      let ganador
      const [a, b, c] = lines[i];
      // evalua si con esos indices existe coincidencia con el mismo valor 
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        // devuelve el valor que se repite 
        if (squares[a] === 'X') {
          ganador = 'J1 (X)'
        }else{
          ganador = 'J2 (0)'
        }
        // return squares[a];
        return ganador;
      }
    }
    //si no existe ganador no retorna nada
    return null;
  }

  