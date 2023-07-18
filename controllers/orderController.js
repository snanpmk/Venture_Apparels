const testrender = async function(req,res) {
    try{
        res.render("test",{})
    } catch (error) {
        console.log("error from the order controller",err);
    }
}


module.exports = {
    testrender
}