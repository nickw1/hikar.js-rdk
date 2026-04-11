
interface LoadingMsgProps {
    message: string;
}

export default function LoadingMsg({ message } : LoadingMsgProps) {
    return(
        <div style={{
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            fontSize: '200%'
        }}>
            <h1 style={{ backgroundColor: 'white', color: 'black'}}>{ message || "Loading scene..." }</h1>
        </div>
    )
}