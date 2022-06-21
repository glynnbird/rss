resource "aws_cloudwatch_event_rule" "runFeedDispatcher" {
    name = "runFeedDispatcher"
    description = "Fires every five minutes to poll each feed"
    schedule_expression = "rate(5 minutes)"
}

resource "aws_cloudwatch_event_target" "runFeedDispatcherEventTarget" {
    rule = aws_cloudwatch_event_rule.runFeedDispatcher.name
    target_id = "feedDispatch"
    arn = aws_lambda_function.feedDispatch.arn
}

resource "aws_lambda_permission" "allowCloudwatchToCallFeedDispatch" {
    statement_id = "AllowExecutionFromCloudWatch"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.feedDispatch.function_name
    principal = "events.amazonaws.com"
    source_arn = aws_cloudwatch_event_rule.runFeedDispatcher.arn
}