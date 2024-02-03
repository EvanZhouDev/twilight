let removeComments = (source) => {
    return source.replaceAll(/\#.*/g, "");
}

export default removeComments;