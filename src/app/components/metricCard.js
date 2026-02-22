export default function metricCard({title, metric, content}) {
    return (
        <div id='card' className='data-card w-full h-full p-4 poppins flex flex-col justify-start items-start'>
            <h3 className="font-stretch-90%">{title}</h3>
            <h6>{content}</h6>
            <p className="oswald text-6xl">{metric}</p>
        </div>
    )
}