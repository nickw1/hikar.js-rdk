
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
            fontSize: '200%',
            backgroundColor: '#c0c0ff',
            color: 'white'
        }}>
            <h1>{ message  }</h1>
        </div>
    )
}