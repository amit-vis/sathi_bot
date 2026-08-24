const formateDate = (date: string)=>{
    const newDate = new Date(date);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const day = newDate.getDate();
    const month = months[newDate.getMonth()];
    const year = newDate.getFullYear();
    return `${day} ${month} ${year}`
}