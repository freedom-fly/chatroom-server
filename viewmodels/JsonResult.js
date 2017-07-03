exports.JsonResult = class JsonResult {
    constructor(state, result, message) {
        this.state = state;
        this.result = result;
        this.message = message;
    }
}

exports.CreateFromResult = function CreateFromResult(result){
    return new JsonResult(result.State,result.Result,result.Message);
}