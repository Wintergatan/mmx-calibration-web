import React, { Component } from 'react';
import stringToStream from 'string-to-stream';
import { saveAs } from 'file-saver';

const { parse, draw, convertToMidi } = require('mmx-calibration-lib');

export default class App extends Component {
  state = {
    hasParsedCsv: false,
    distanceBetweenRods: 5,
    plateWidth: 798,
    plateHeight: 1300,
  };

  onChangeHandler = (event) => {
    console.log(event.target.name);
    if (event.target.name === 'file-input') {
      const csvFile = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        this.csv = reader.result;
        this.draw();
      };
      reader.readAsText(csvFile);
      this.setState({
        hasParsedCsv: true,
      });
    } else {
      this.setState({
        [event.target.name]: event.target.value,
      });
    }
  };

  draw = () => {
    parse(stringToStream(this.csv), (musicData) => {
      console.log(musicData);
      const midiBlob = new Blob([convertToMidi(musicData)], {
        type: 'audio/midi audio/x-midi',
      });
      const options = {
        distanceBetweenRods: this.state.distanceBetweenRods,
        plateWidth: this.state.plateWidth,
        plateHeight: this.state.plateHeight,
      };
      const drawings = draw(musicData, options);
      this.setState({
        svg: drawings.svg,
      });

      this.midiBlob = midiBlob;
      this.svgBlob = new Blob([drawings.svg], { type: 'image/svg+xml' });
      this.dxfBlob = new Blob([drawings.dxf], { type: 'application/dxf' });
    });
  };

  render() {
    const {
      hasParsedCsv,
      svg,
      distanceBetweenRods,
      plateWidth,
      plateHeight,
    } = this.state;
    return (
      <div>
        <div>
          <label>SVG-file:</label>
          <input
            type="file"
            name="file-input"
            onChange={this.onChangeHandler}
          />
        </div>
        <div>
          <label>distanceBetweenRods:</label>
          <input
            type="number"
            name="distanceBetweenRods"
            value={distanceBetweenRods}
            onChange={this.onChangeHandler}
          />
        </div>
        <div>
          <label>plateWidth:</label>
          <input
            type="number"
            name="plateWidth"
            value={plateWidth}
            onChange={this.onChangeHandler}
          />
        </div>
        <div>
          <label>plateHeight:</label>
          <input
            type="number"
            name="plateHeight"
            value={plateHeight}
            onChange={this.onChangeHandler}
          />
        </div>
        <div>
          <button disabled={!hasParsedCsv} onClick={this.draw}>
            Draw!
          </button>
        </div>
        <div>
          <button
            disabled={!hasParsedCsv}
            onClick={() => {
              saveAs(this.midiBlob, 'parsed-music.midi');
            }}
          >
            Download MIDI
          </button>
          <button
            disabled={!hasParsedCsv}
            onClick={() => {
              saveAs(this.svgBlob, 'output.svg');
            }}
          >
            Download SVG
          </button>
          <button
            disabled={!hasParsedCsv}
            onClick={() => {
              saveAs(this.dxfBlob, 'output.dxf');
            }}
          >
            Download DXF
          </button>
        </div>

        <div dangerouslySetInnerHTML={{ __html: svg }} />
      </div>
    );
  }
}
