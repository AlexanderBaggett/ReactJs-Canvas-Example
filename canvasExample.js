import React, { useState, useEffect,useRef } from "react";
import debounce from 'lodash.debounce';


const CanvasExample = props => {

    const {toggle, addressInfo, backgroundImage,  ...rest} = props;
    const canvasRef = useRef(null);
    const [coordinates,setCoordinates] = useState([]);
    const [polyComplete,setPolyComplete] = useState(false);
    const hitboxSize =4;
    const black ="rgb(0,0,0)";
    const lightGreen = "rgba(0,255,0,0.2)";


    useEffect(()=>{
        debounce(() =>{
            clearScreen();
          },50);
        
    },[canvasRef.current])


    const clearScreen = () =>{
        let ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    

    useEffect( () => { 
        //draw dots if there is 1 or more coordinates
        if(coordinates.length>=1){
            reDrawDots();
        }
        //draw lines if there are 2 or more coordinates
        if(coordinates.length>=2){
            reDrawLines();
        }
    },[coordinates])


    const reDrawLines = () => {
        let ctx = canvasRef.current.getContext("2d");
        ctx.beginPath();
        let first = true;
        for(let i =0; i<coordinates.length; i++) {
            let coord= coordinates[i];
            if(first){
                ctx.moveTo(coord.x,coord.y);
                first=false;
            }
            else{
                ctx.lineTo(coord.x,coord.y);
            }
        }
        if(polyComplete){
            ctx.closePath();
            ctx.fillStyle = lightGreen;
            ctx.fill();
        }
        ctx.stroke();
    }

    const reDrawDots = () => {
        let ctx = canvasRef.current.getContext("2d");
        for(let i =0; i<coordinates.length; i++) {
            let coord= coordinates[i];
            ctx.beginPath();
            ctx.arc(coord.x,coord.y,hitboxSize,0, 2*Math.PI);
            ctx.fillStyle = black;
            ctx.fill();
        }
    }


    const canvasClick = e => {
        if(!polyComplete) {          
            let first = coordinates[0];
            let rect = canvasRef.current.getBoundingClientRect(); 
            //client x any y are just window coords we need the coords relative to inside the canvas

            let current = {x: Math.round(e.clientX  - rect.left), y: Math.round(e.clientY  - rect.top)};
            let deepcopy = Array.from(coordinates);

            //check to see if we are close enough to complete the polygon
            if(first){
                let distX= Math.abs(current.x - first.x);
                let distY= Math.abs(current.y - first.y);
                if(distX <= hitboxSize 
                && distY <= hitboxSize
                && deepcopy.length>2) {
                    //if we are close enough, do not add the last coordinate, 
                    // just complete the polygon
                    setPolyComplete(true);
                } else{
                    //add the coordinate, draw the line, draw the dot
                    deepcopy.push(current);
                }
            }
            else{
                //add the coordinate, draw the dot
                deepcopy.push(current);
            }
            setCoordinates(deepcopy);
        }
    }


    const resetCoords = () => {
        clearScreen();
        setCoordinates([]);
        setPolyComplete(false);
    }

    const undo = () => {
        clearScreen();
        setCoordinates(coordinates.slice(0,-1));
        setPolyComplete(false);
    }

    const finish = async  () => {

        if(coordinates!=[]){
            const coords= coordinates.map(c =>c.x +" " +c.y).toString();
            //your api call here to save the coords
        }
    }


    return (
    <div>
        {backgroundImage &&
            <canvas
            ref = {canvasRef}
            onClick = {(e) => canvasClick(e) }
            width={1000}
            height={700}
            style ={{borderWidth:"1px",borderColor:"black",borderStyle:"solid"
                    ,background: 'url('+backgroundImage+')'   }}
            > 

            </canvas>
        }

        <div style={{display:'flex',flex:1,flexDirection:'row',width:'100%',paddingTop:'1rem'}}>
            <div style={{ display:'flex', flex:1, flexDirection:'row', width:'100%'}}>
                <button  title="Undo" onClick={() =>undo()}/>
                <button  title="Reset" onClick={() =>resetCoords()}/>
                <button  title="Complete" onClick={() =>finish()}/>
            </div>
        </div>
    </div>
    );

}
export default CanvasExample;