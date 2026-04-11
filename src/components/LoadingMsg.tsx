
export default function LoadingMsg() {
    return(
        <div style={{
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            fontSize: '200%'
        }}>
            <h1 style={{ backgroundColor: 'white', color: 'black'}}>Loading scene...</h1>
        </div>
    )
}