
export const func = <T>(varGetter: () => T) => {
  // const v = varGetter();

  // $effect(() => {
  //   console.log(v);
  // })

  return () => {
    console.log(varGetter());
  }
};
