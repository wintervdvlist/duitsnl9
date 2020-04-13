import React from "react";
import PropTypes from "prop-types";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Card from "@material-ui/core/Card";
import FormControlLabel from "@material-ui/core/FormControlLabel";

const propTypes = {
  text: PropTypes.string.isRequired,
  customClass: PropTypes.string,
  selectionHandler: PropTypes.func
};

const range = function(start, end) {
  var ans = [];
  for (let i = start; i <= end; i++) {
    ans.push(i);
  }
  return ans;
};

const getSpanArray = function(cBlocks) {
  var sArray = [];
  for (let i = 0; i < cBlocks.length; i++) {
    var { html } = cBlocks[i];
    // console.log('cBlocks[i]: ', cBlocks[i])
    // console.log('html: ', html)
    sArray.push(html);
  }
  return sArray;
};

/**
 * Highlighter component.
 *
 * Allows highlighting of the text selected by mouse with given custom class (or default)
 * and calls optional callback function with the following selection details:
 * - selected text
 * - selection start index
 * - selection end index
 */
export class HighLighter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: props.text,
      isDirty: false,
      selection: "",
      selCollection: "",
      anchorNode: "?",
      focusNode: "?",
      selectionStart: 0,
      selectionEnd: 0,
      first: props.text,
      middle: "",
      last: "",
      registerCount: 0,
      selectedClass: "das Subjekt",
      spanArray: [],
      selectionArray: [
        { middle: "", selectionStart: 0, selectionEnd: 0, selectedClass: "" }
      ],
      classArray: [
        { middle: "", selectionStart: 0, selectionEnd: 0, className: "green" }
      ]
    };
    this.onMouseUpHandler = this.onMouseUpHandler.bind(this);
  }

  getContiguousBlocks(inpArray, classAsignment) {
    var outputArray = [];
    var lastFirstInd = 0;
    var textSlice = "";
    var textchunk;
    var textlength = this.state.text.length;

    // Case: first snippet of text not included in selection,
    //       and must be assigned to 'noClass'
    if (inpArray[lastFirstInd] > 0) {
      textSlice = this.state.text.slice(0, inpArray[lastFirstInd]);
      textchunk = {
        range: range(0, inpArray[lastFirstInd]),
        text: textSlice,
        html: <span className="noClass">{textSlice}</span>,
        class: "noClass"
      };
      outputArray.push(textchunk);
    }

    // Case: middle part.
    for (let i = 0; i <= inpArray.length; i++) {
      //
      if (i === inpArray.length - 1 || inpArray[i + 1] - inpArray[i] > 1) {
        textSlice = this.state.text.slice(inpArray[lastFirstInd], inpArray[i]);
        textchunk = {
          range: range(inpArray[lastFirstInd], inpArray[i]),
          text: textSlice,
          html: <span className="highlight">{textSlice}</span>,
          class: "highlight"
        };

        outputArray.push(textchunk);
        lastFirstInd = i;

        //
        if (inpArray[i + 1] - inpArray[i] > 1) {
          textSlice = this.state.text.slice(inpArray[i], inpArray[i + 1] - 1);
          textchunk = {
            range: range(inpArray[i] + 1, inpArray[i + 1]),
            text: textSlice,
            html: <span className="noClass">{textSlice}</span>,
            class: "noClass"
          };
          outputArray.push(textchunk);
        }
      }
    }

    // Case: last part.
    if (inpArray[lastFirstInd - 1] < textlength) {
      textSlice = this.state.text.slice(inpArray[lastFirstInd], textlength);

      textchunk = {
        range: range(inpArray[lastFirstInd], textlength),
        text: textSlice,
        html: <span className="noClass">{textSlice}</span>,
        class: "noClass"
      };
      outputArray.push(textchunk);
    }

    console.log("textlength: ", textlength);
    console.log("inpArray length: ", inpArray.length);
    console.log("lastFirstInd: ", lastFirstInd);
    console.log("inpArray[lastFirstInd]: ", inpArray[lastFirstInd - 1]);

    return outputArray;
  }

  getUniqueSet(arrayObject) {
    var completeArray = [];
    for (var i = 1; i < arrayObject.length; i++) {
      const N = arrayObject[i].selectionEnd;
      const Nmin = arrayObject[i].selectionStart;
      const tempSeq = range(Nmin, N);
      completeArray.push(tempSeq);
    }
    completeArray = Array.from(new Set(completeArray.flat())).sort();
    var contigArray = this.getContiguousBlocks(completeArray);
    console.log("completeArray: ", completeArray);
    console.log("contigArray: ", contigArray);
    return contigArray;
  }

  onMouseUpHandler(e) {
    e.preventDefault();
    const selectionObj = window.getSelection && window.getSelection();
    const selection = selectionObj.toString();
    const anchorNode = selectionObj.anchorNode;
    const focusNode = selectionObj.focusNode;
    const anchorOffset = selectionObj.anchorOffset;
    const focusOffset = selectionObj.focusOffset;
    const position = anchorNode.compareDocumentPosition(focusNode);
    let forward = false;

    if (position === anchorNode.DOCUMENT_POSITION_FOLLOWING) {
      forward = true;
    } else if (position === 0) {
      forward = focusOffset - anchorOffset > 0;
    }

    let selectionStart = forward ? anchorOffset : focusOffset;

    // if (this.state.registerCount !== 0){
    //   selectionStart += this.state.selectionEnd;
    // }

    const selectionEnd = selectionStart + selection.length;
    const first = this.state.text.slice(0, selectionStart);
    const middle = this.state.text.slice(selectionStart, selectionEnd);
    const last = this.state.text.slice(selectionEnd);

    console.log("selectionStart:", selectionStart);
    console.log("position:", position);
    console.log("focusOffset :", focusOffset);
    console.log("anchorOffset:", anchorOffset);
    console.log("anchornode :", anchorNode);
    console.log("focusnode :", focusNode);
    console.log("anchorOffset:", anchorOffset);
    console.log("middle:", middle);

    // if (forward && anchorNode.parentNode.getAttribute("data-order")) {

    //     selectionStart += this.state.selectionStart;

    // } else if(anchorNode.parentNode.getAttribute("data-order")) {
    //     selectionStart += this.state.selectionStart;
    // }

    console.log("selectionStart2:", selectionStart);

    const newinfo = {
      middle: middle,
      selectionStart: selectionStart,
      selectionEnd: selectionEnd,
      selectedClass: this.state.selectedClass
    };
    //const oldinfo = this.state.selectionArray;

    if (this.state.registerCount === 0) {
      this.setState({
        selectionArray: [newinfo],
        spanArray: getSpanArray(this.getUniqueSet([newinfo]))
      });
    } else {
      this.state.selectionArray.push(newinfo);
      this.setState({
        spanArray: getSpanArray(this.getUniqueSet(this.state.selectionArray))
      });

      // var spanArray = this.getSpanArray(this.getUniqueSet(this.state.selectionArray));
    }

    console.log("selectionArray: ", this.state.selectionArray);
    console.log("newinfo: ", newinfo);

    // const joinedinfo = oldinfo.push(newinfo);

    // console.log(' newinfo ', oldinfo)
    // console.log(' newinfo ', newinfo)
    // console.log(' joinedinfo ', joinedinfo)
    // console.log(' oldinfo.push(newinfo) ', oldinfo.push(newinfo))
    //const newArray = this.state.selectionArray.concat(middle);

    this.setState({
      selection: selection,
      anchorNode: anchorNode,
      focusNode: focusNode,
      selectionStart,
      selectionEnd,
      // first,
      middle,
      last,
      registerCount: this.state.registerCount + 1
    });

    if (this.props.selectionHandler) {
      this.props.selectionHandler({
        selection,
        selectionStart,
        selectionEnd
      });
    }
  }

  handleChange = event => {
    this.setState({
      selectedClass: event.target.value
    });
  };

  render() {
    // console.log(" pre render selection 1: ", this.state.selection);

    // console.log(" pre render selection 2: ", this.state.selection);
    // console.log(" first 2: ", this.state.first);
    // console.log(" middle 2: ", this.state.middle);
    // console.log(" last 2: ", this.state.last);
    // console.log(" selectionArray: ", this.state.selectionArray);
    return (
      <Card>
        <RadioGroup
          aria-label="gender"
          name="gender1"
          value={this.state.selectedClass}
          onChange={this.handleChange}
        >
          <FormControlLabel
            value="das Subjekt"
            control={<Radio />}
            label="das Subjekt"
          />
          <FormControlLabel
            value="das Prädikat"
            control={<Radio />}
            label="das Prädikat"
          />
          <FormControlLabel
            value="das Objekt"
            control={<Radio />}
            label="das Objekt"
          />
          <FormControlLabel
            value="adverbiale Bestimmung"
            control={<Radio />}
            label="adverbiale Bestimmung"
          />
          <FormControlLabel
            value="das Prädikativ"
            control={<Radio />}
            label="das Prädikativ"
          />
        </RadioGroup>
        <span onMouseUp={this.onMouseUpHandler}>
          <span data-order="first">{this.state.first}</span>
        </span>
        <br />
      </Card>
    );
  }
}

HighLighter.propTypes = propTypes;
