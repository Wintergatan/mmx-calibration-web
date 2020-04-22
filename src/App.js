import React, { Component } from 'react';
import stringToStream from "string-to-stream"
import { saveAs } from 'file-saver';

const { parse, draw, convertToMidi } = require('mmx-calibration-lib')

export default class App extends Component {

  state = {
    hasParsedCsv: false
  }

  onChangeHandler = event => {
    const csvFile = event.target.files[0]
    const reader = new FileReader();

    reader.onload = (e) => {
      parse(stringToStream(reader.result), musicData => {
        console.log(musicData);
        const midiBlob = new Blob([convertToMidi(musicData)], {
          type: "audio/midi audio/x-midi"
        });
        const drawings = draw(musicData);
        this.setState({
          hasParsedCsv: true,
          svg: drawings.svg
        })
        
        this.midiBlob = midiBlob;
        this.svgBlob = new Blob([drawings.svg],{type:"image/svg+xml"})
        this.dxfBlob = new Blob([drawings.dxf],{type:"application/dxf"})
      })
    }
    reader.readAsText(csvFile);
  }

  render() {
    const { hasParsedCsv, svg } = this.state
    return (
    <div>
      <label>SVG-file:</label>
        <input 
          type = "file"
          name = "file"
          onChange = {this.onChangeHandler}
      />
      <button disabled={!hasParsedCsv} onClick={()=>{saveAs(this.midiBlob, "parsed-music.midi")}}>Download MIDI</button>
      <button disabled={!hasParsedCsv} onClick={()=>{saveAs(this.svgBlob, "output.svg")}}>Download SVG</button>
      <button disabled={!hasParsedCsv} onClick={()=>{saveAs(this.dxfBlob, "output.dxf")}}>Download DXF</button>
      <div dangerouslySetInnerHTML={{__html: svg}} />
    </div>)
  }
}