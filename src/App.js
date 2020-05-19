import React, { Component } from 'react';
import stringToStream from 'string-to-stream';
import { saveAs } from 'file-saver';

const { parse, draw, convertToMidi } = require('mmx-calibration-lib');

export default class App extends Component {
  state = {
    hasParsedCsv: false,
    distanceBetweenRods: 2.54,
    plateWidth: 798,
    plateHeight: 652,
    distanceBetweenChannels: 21,
    rodRadius: 2.5,
    origin: [10.5, 2.54],
    filename: '',
  };

  onChangeHandler = (event) => {
    console.log(event.target.name);
    const { name, value } = event.target;
    if (name === 'file-input') {
      const csvFile = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        this.csv = reader.result;
        this.draw();
      };
      reader.readAsText(csvFile);
      const filename = event.target.files[0].name.split('.')[0];
      this.setState({
        hasParsedCsv: true,
        filename,
      });
    } else if (name === 'originX') {
      this.setState((state) => ({
        origin: [Number.parseFloat(value), state.origin[1]],
      }));
    } else if (name === 'originY') {
      this.setState((state) => ({
        origin: [state.origin[0], Number.parseFloat(value)],
      }));
    } else if (name === 'filename') {
      this.setState((state) => ({
        filename: value,
      }));
    } else {
      this.setState({
        [name]: Number.parseFloat(value),
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
        distanceBetweenChannels: this.state.distanceBetweenChannels,
        rodRadius: this.state.rodRadius,
        origin: this.state.origin,
      };
      const drawings = draw(musicData, options);
      this.setState({
        svg: drawings.svg,
      });

      this.midiBlob = midiBlob;
      this.svgBlob = new Blob([drawings.svg], { type: 'image/svg+xml' });
      console.log(this.svgBlob);
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
      distanceBetweenChannels,
      rodRadius,
      origin,
      filename,
    } = this.state;
    return (
      <div>
        <div>
          <a
            href="/calibration_sheet.csv"
            alt="calibration sheet"
            target="_blank"
          >
            Example calibration sheet
          </a>
        </div>
        <div>
          <label>CSV-file:</label>
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
          <label>distanceBetweenChannels:</label>
          <input
            type="number"
            name="distanceBetweenChannels"
            value={distanceBetweenChannels}
            onChange={this.onChangeHandler}
          />
        </div>
        <div>
          <label>rodRadius:</label>
          <input
            type="number"
            name="rodRadius"
            value={rodRadius}
            onChange={this.onChangeHandler}
          />
        </div>
        <div>
          <label>origin X:</label>
          <input
            type="number"
            name="originX"
            value={origin[0]}
            onChange={this.onChangeHandler}
          />
          <label>origin Y:</label>
          <input
            type="number"
            name="originY"
            value={origin[1]}
            onChange={this.onChangeHandler}
          />
        </div>
        <div>
          <button disabled={!hasParsedCsv} onClick={this.draw}>
            Draw!
          </button>
        </div>
        <div>
          <input
            type="text"
            name="filename"
            value={filename}
            onChange={this.onChangeHandler}
          />
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
              saveAs(this.svgBlob, filename + '.svg');
            }}
          >
            Download SVG
          </button>
          <button
            disabled={!hasParsedCsv}
            onClick={() => {
              saveAs(this.dxfBlob, filename + '.dxf');
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
