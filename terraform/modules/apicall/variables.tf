
variable "function_name" {}
variable "role" {}
variable "runtime" {
  default = "nodejs20.x"
}
variable "timeout" {
  default = 60
}
variable "table" {}
variable "layer" {}
variable "api_key" {}
