import React, { Component } from 'react';

class PickBan extends React.Component {


    render (){
        let image = <div></div>
        let name  = "" // {this.props.selectionNumber}
        
        if (this.props.name != ""){
            image = <img src={process.env.PUBLIC_URL+this.props.image}/>
            name  = this.props.name
        }
        console.log("In pickban = " + this.props.image)


        return (<div>
                    <div class = "pickImage">
                        {image}
                    </div>
                    <div class = "pickName">{name}</div>
                </div>
        )
    }



}


export default PickBan;