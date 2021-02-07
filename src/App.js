import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import "./App.css";

export default function App () {

  const [excelFile, setState] = useState(""); 
  const [fileName, setFileName] = useState(""); 
  const [excelData, setExcelData] = useState(null); 
  const [error, setError] = useState(null); 
  const [loader, setLoader] = useState(false); 
  const fileUploader = useRef(null);

  const json2array = json => {
    var result = [];
    var keys = Object.keys(json);
    keys.forEach(key => {
        result.push(json[key]);
    });
    return result;
}

  const readFile = () => {
    var {file} = excelFile;
    if( file ) {
        setLoader(true);
        setFileName(file.name.substring(0, file.name.lastIndexOf('.')).replaceAll('_', ' '));
        const reader = new FileReader();
        reader.onload = (evt) => {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
          setExcelData(json2array(data)); // shows data in json format
          setLoader(false);
        };
        reader.readAsBinaryString(file);
    } else {
      setError("Please upload a spreadsheet file before reading it!");
    }
  }

  const filePathset = (e) => {
    e.stopPropagation();
    e.preventDefault();
    var file = e.target.files[0];
    setState({ file });
  }
  
  // Validate cell's date DD/MM/YYYY 
  const isValidDate = (dateString) => {
    var regEx = /^\d{2}\/\d{2}\/\d{4}$/;
    if(!dateString.match(regEx)) return false;  // Invalid format
    var d = new Date(dateString);
    var dNum = d.getTime();
    if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
    return d.toISOString().slice(0,10) === dateString;
  }
  

  // Validate date cells
  const validationCells = (cell, index) => {
      if( index === 7) {
          if(isValidDate(cell)) {
            return cell
          } else {
            return 'Invalid date'
          }
      }
      if(index === 11 || index === 12 || index === 14 || index === 15 || index === 16 || index === 17) {
          if(isValidDate(cell)) {
            return cell
          } else {
            return 'Invalid date'
          }
      }
  }

  const displayData = () => {
      const getRowsWithData = excelData.filter( item => item.length > 0);
      const titles = getRowsWithData[2];
      const validation = getRowsWithData[4];
      const cells = titles.map((_, a) => {
        const isMandatory = validation[a] === 'Mandatory';
        return <td style={{color: isMandatory ? 'red' : 'black'}} key={a}>{validation[a]}</td>
      });
      const rows = excelData.filter( (_, i) => i > 5);
      const header = <tr>{titles.map((title, i) => <th key={i}>{title}</th>)}</tr>;
      const body =
        rows.map((row, i) => {
            return row.length === 0 ?
              (<tr key={i}>{cells}</tr>) :
              (<tr key={i}>{row.map((cell, b) => <td key={b}>{cell === '' && validation[i] === 'Mandatory' ? 'Mandatory' : validationCells(cell)}</td>)}</tr>)
        })
      return (<table cellSpacing="0"><tbody>
          {header}
          {body}
          </tbody></table>);
  }
  
  return (
      <>
        <input
          type="file"
          id="file"
          ref={fileUploader}
          onChange={filePathset}
        />
        <button
          onClick={() => {
            readFile();
          }}
        >
          Read File
        </button>
        {error && <h2 style={{color: 'red'}}>{error}</h2>}
        {fileName && <h1>{fileName}</h1>}
        {loader && <h1 style={{color: 'red', }}>Loading...</h1>}
        {excelData && displayData()}
      </>
  );
}
