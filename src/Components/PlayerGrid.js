import React, { Component } from "react";
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import Form from "react-bootstrap/Form"
class PlayerGrid extends Component {
  constructor(props){
    super(props)
    this.state = {
      modalShow: false,
      setModalShow: false
    }
  }
  

  render() {
    let letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    let i, j;
    let grid = [];
    for (i = 0; i < 10; i++) {
      for (j = 1; j <= 10; j++) {
        let id = "P1[" + letters[i] + "," + j + "]";
        grid.push(
          <button
            className="item"
            key={id}
            id={id}
            onClick={(e) => {
              console.log("Sicko mode");
              console.log(e.target.id);
            }}
          ></button>
        );
      }
    }
    return (
      <div>
        <FormModal
          show={this.state.modalShow}
          onHide={() => this.setState({
            setModalShow: false
          })}
        ></FormModal>
        <Button variant="dark" onClick={() => this.setState({
          setModalShow: true
        })}>Load Your Pieces</Button>
        <div className="board">{grid}</div>
      </div>
    );
  }
}

function FormModal(props){
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Build Your Board
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Choose your piece layours</h4>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default PlayerGrid;
