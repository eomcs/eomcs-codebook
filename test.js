let foo = 'bar1';
console.log(foo); // bar1
 
if (true) {
  console.log(foo);
  // Uncaught ReferenceError: foo is not defined
 
  //let foo = 'bar2';
}
 
console.log(foo);