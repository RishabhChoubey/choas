export default async function Loading() {
  return (
    <div className=" left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] absolute">
      <div class="lds-ripple">
        <div></div>
        <div></div>
      </div>
    </div>
  );
}
