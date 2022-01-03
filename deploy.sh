rm -rf web/build
(cd web; npm run build)
git add web/build
git commit -m "Build $(date +%s)"
git push -d github gh-pages
git subtree push --prefix web/build github gh-pages
git reset --hard HEAD~1