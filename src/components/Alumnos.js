import React, { Component } from "react";
import Global from "../Global";
import axios from "axios";
import jsPDF from "jspdf";

export default class Alumnos extends Component {
  state = {
    alumnos: [],
    status: false,
    seleccionados: [],
    grupos: [],
    cajaAlumnos: [],
  }

  selectAlumno = React.createRef();

  loadAlumnos = () => {
    var request = "api/alumnos/filtrarcurso/" + 2023;
    var url = Global.apiSorteo + request;

    axios.get(url).then((response) => {
      this.setState({
        alumnos: response.data,
        status: true,
      })
    })
  }

  seleccionar = () => {
    var aux = [];
    for (var i of this.selectAlumno.current.options) {
      if (i.selected === true) {
        var nom = i.value + ", ";
        aux.push(nom);
      }
    }
    this.setState({
      seleccionados: aux
    })
  }

  generarPDF = () => {
    const doc = new jsPDF();
    this.state.seleccionados.forEach((alumn, index) => {
      doc.text(`${index + 1}. ${alumn}`, 10, 10 + index * 10);
    })
    doc.save('sorteo.pdf');
  }

  generarGrupos = () => {
    var grupos = [];
    for (var i = 1; i <= 8; i++) {
      grupos.push(i);
    }
    this.setState({
      grupos: grupos,
    })
  }

  generarSorteo = () => {
    var interval = setInterval(() => {
      var idRandom = Math.floor(Math.random() * this.state.alumnos.length);
      var idRandomGrupo = Math.floor(Math.random() * this.state.grupos.length);
      var nuevoAlumno = this.state.alumnos[idRandom];

      var cantidadAlumnos = parseInt(this.state.alumnos.length / this.state.grupos.length);
      console.log("Numero de alumnos por grupo: " + cantidadAlumnos);

      if (!this.state.seleccionados.includes(nuevoAlumno)) {
        var nuevosSeleccionados = [...this.state.seleccionados, nuevoAlumno];

        this.setState({
          seleccionados: nuevosSeleccionados,
        });

        var grupoAsignado = false;
        for (var i = 0; i < this.state.grupos.length; i++) {
          var grupoIndex = (idRandomGrupo + i) % this.state.grupos.length;

          if (
            Array.isArray(this.state.grupos[i]) &&
            this.state.grupos[grupoIndex].length < cantidadAlumnos
          ) {
            var nuevosGrupos = [...this.state.grupos];
            nuevosGrupos[grupoIndex] = [
              ...(Array.isArray(nuevosGrupos[grupoIndex]) ? nuevosGrupos[grupoIndex] : []),
              nuevoAlumno,
            ];

            var nuevosAlumnos = this.state.cajaAlumnos.filter(
              alumno => alumno.idAlumno !== nuevoAlumno.idAlumno
            );

            this.setState({
              grupos: nuevosGrupos,
              cajaAlumnos: nuevosAlumnos,
            });

            grupoAsignado = true;
            console.log(`Alumno ${nuevoAlumno} asignado al Grupo ${grupoIndex + 1}`);
            console.log(this.state.cajaAlumnos);
            break;
          }
        }

        if (!grupoAsignado) {
          for (let i = 0; i < this.state.grupos.length; i++) {
            if (!Array.isArray(this.state.grupos[i])) {
              var newGrupos = [...this.state.grupos];
              newGrupos[i] = [nuevoAlumno];
              this.setState({
                grupos: newGrupos,
              });
              console.log(`Alumno ${nuevoAlumno} asignado al nuevo Grupo ${i + 1}`);
              break;
            }
          }
        }
        // Detener cuando todos los alumnos estén asignados
        if (nuevosSeleccionados.length >= this.state.alumnos.length) {
          clearInterval(interval);
          return;
        }
      } else {
        console.log(`${nuevoAlumno}, ya está en otro grupo`);
      }
    }, 500);
  };

  componentDidMount = () => {
    this.loadAlumnos();
    this.generarGrupos();
  }

  render() {
    return (
      <div>
        <main className='m-4 bg-neutral-900 p-2'>
          <h2 className="text-xl text-center text-sky-900 font-bold mb-6">Generador de Equipos</h2>
          <section className='flex flex-row justify-center gap-2'>
            <div>
              <h2 className="text-xl text-sky-900 font-bold mb-6">Alumnos</h2>
              <div
                className="relative group rounded-lg h-80 w-64 bg-gray-50 overflow-hidden before:absolute before:w-12 before:h-12 before:content[''] before:right-0 before:bg-green-500 before:rounded-full before:blur-lg before:[box-shadow:-60px_20px_10px_10px_#3390C8]"
              >
                {
                  this.state.status === true &&
                  (
                    <select className="appearance-none  hover:placeholder-shown:bg-emerald-500 relative text-sky-400 bg-transparent ring-0 outline-none border border-neutral-500  placeholder-green-700 text-sm font-bold rounded-lg focus:ring-green-500 focus:border-green-500 block w-full h-full p-2.5" multiple ref={this.selectAlumno} onChange={this.seleccionar}>
                      {this.state.alumnos.map((alumno, index) => {
                        return (
                          <option className="text-sky-400" key={index} value={alumno.nombre}>{alumno.nombre}</option>
                        )
                      })}
                    </select>
                  )
                }

              </div>
              <button onClick={this.generarSorteo} className="relative  mt-8 border hover:border-sky-600 duration-500 group cursor-pointer text-sky-50  overflow-hidden h-14 w-full rounded-md bg-sky-800 p-2 flex justify-center items-center font-extrabold">
                <div className="absolute z-10 w-48 h-48 rounded-full group-hover:scale-150 transition-all  duration-500 ease-in-out bg-sky-900 delay-150 group-hover:delay-75"></div>
                <div className="absolute z-10 w-40 h-40 rounded-full group-hover:scale-150 transition-all  duration-500 ease-in-out bg-sky-800 delay-150 group-hover:delay-100"></div>
                <div className="absolute z-10 w-32 h-32 rounded-full group-hover:scale-150 transition-all  duration-500 ease-in-out bg-sky-700 delay-150 group-hover:delay-150"></div>
                <div className="absolute z-10 w-24 h-24 rounded-full group-hover:scale-150 transition-all  duration-500 ease-in-out bg-sky-600 delay-150 group-hover:delay-200"></div>
                <div className="absolute z-10 w-16 h-16 rounded-full group-hover:scale-150 transition-all  duration-500 ease-in-out bg-sky-500 delay-150 group-hover:delay-300"></div>
                <p className="z-10">Magia!</p>
              </button>
              <button onClick={this.generarPDF} className="relative mt-8 group cursor-pointer text-sky-50  overflow-hidden h-16 w-64 rounded-md bg-sky-800 p-2 flex justify-center items-center font-extrabold">

                <div className="absolute top-3 right-20 group-hover:top-12 group-hover:-right-12 z-10 w-40 h-40 rounded-full group-hover:scale-150 group-hover:opacity-50 duration-500 bg-sky-900"></div>
                <div className="absolute top-3 right-20 group-hover:top-12 group-hover:-right-12 z-10 w-32 h-32 rounded-full group-hover:scale-150 group-hover:opacity-50 duration-500 bg-sky-800"></div>
                <div className="absolute top-3 right-20 group-hover:top-12 group-hover:-right-12 z-10 w-24 h-24 rounded-full group-hover:scale-150 group-hover:opacity-50 duration-500 bg-sky-700"></div>
                <div className="absolute top-3 right-20 group-hover:top-12 group-hover:-right-12 z-10 w-14 h-14 rounded-full group-hover:scale-150 group-hover:opacity-50 duration-500 bg-sky-600"></div>
                <p className="z-10">Descarga pdf</p>
              </button>

            </div>

            <div className='bg-sky-600 rounded-lg p-8 py-16 max-w-7xl w-full flex flex-row justify-center flex-wrap gap-8'>
              {this.state.grupos.map((grupo, index) => (
                <div className='flex flex-col' key={index}>
                  <span className='text-xl text-neutral-50 font-bold mb-6'>Grupo {index + 1}</span>
                  <div className="w-56 relative overflow-hidden z-10 bg-white p-4 rounded-lg shadow-md before:w-24 before:h-24 before:absolute before:bg-purple-500 before:rounded-full before:-z-10 before:blur-2xl after:w-32 after:h-32 after:absolute after:bg-sky-400 after:rounded-full after:-z-10 after:blur-xl after:top-24 after:-right-12">
                    {Array.isArray(grupo) && grupo.map((alumno, i) => (
                      <h2 key={i} className="text-xl text-sky-900 font-bold mb-6">{alumno.nombre}</h2>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    )
  }
}