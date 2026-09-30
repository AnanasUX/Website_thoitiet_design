const test = () => {
  const isFetchingCategory = true;
  const NewsSkeleton = () => <div/>;
  return (
    <div>
      {isFetchingCategory ? <NewsSkeleton /> : (<>
        <div>Hello</div>
      </>)}
    </div>
  )
}