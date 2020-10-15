import React from 'react';

class PickBan extends React.Component {


    render (){
        let image = <div></div>
        let name  = "" // {this.props.selectionNumber}
        
        if (this.props.name !== ""){
            name  = this.props.name
            image = <img src={process.env.PUBLIC_URL+this.props.image} alt={name}/>
        }


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