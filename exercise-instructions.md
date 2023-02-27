**Background**  
At Proton we have data in multiple MySQL databases. Foreign key constraints do not work cross-database, and they prevent
us from doing online schema changes. As a result, we design our application layers to:

- Enforce database consistency instead of depending on foreign key constraints.

- Check database consistency automatically and alert us to otherwise silent problems or application bugs.

- Keep reference counts consistent in our blob storage system. When a reference count reaches zero, the blob is deleted,
  which could happen prematurely if the count is wrong. Likewise, the blob could remain on disk forever if the blob
  count is wrong in the other direction.

**Task**  
This task is mostly language-agnostic (aside from SQL). Most of our backend is built in PHP 8, though it is ok if you
prefer to complete the task in another programming language. Your test DB files should be importable into either MySQL
5.7, or a modern version of MariaDB.

See attached for the databases you'll be working with. References to the blob rows are contained in the following
columns:  

- **Global list of blobs: `ProtonMailGlobal.BlobStorage`**

- **Columns referencing them:**
  - `ProtonMailGlobal`
    - `BlobStorageID`
      - `ProtonMailGlobal.SentMessage`
      - `ProtonMailGlobal.SentAttachment`
  - `ProtonMailShard`
    - `BlobStorageID`
      - `ProtonMailShard.Attachment`
      - `ProtonMailShard.OutsideAttachment`
      - `ProtonMailShard.ContactData`
    - `Body` / `Header`
      - `ProtonMailShard.MessageData`

The references refer to rows in `ProtonMailGlobal.BlobStorage`. These rows have a column named `NumReferences`, which is
the master reference count for that blob.

**The objective of this task is to detect inconsistencies in blob reference counts, including count mismatches,
references to missing blobs, and orphan blobs with nonzero reference count.**

_Note:_ rows in the `BlobStorage` table with `NumReferences` = 0 are fine, they are cleaned up asynchronously.

**Time limit**  
As this is a development test, we don't expect you to spend a tremendous amount of time on it. You may want to time box
to 8 hours total. Feel free to do it when your schedule permits.

**Considerations**

- Efficiency: avoid expensive queries, though this rule can be bent if justified by speed or other considerations. Since
  detecting inconsistencies is a read-only check, we can run it on the replication slaves rather than on the masters if
  it makes sense to do so. Indices can be modified.

- Speed: current order of magnitude of blob number is `10^9`.

- Resiliency: assume your solution will be run on a live, non-static collection of databases.

- Scaling: write with parallelization in mind.

- Form: take look at the job description to have an idea of what we'll be looking for. Please also provide a _readme.md_
  file with the idea description and clear instructions on how to run it.

You can send us the source code via mail or Github/Gitlab in a **private** repository (if you use Github/Gitlab, please
add the user [techinterviewer@protonmail.com](mailto:techinterviewer@protonmail.com) to your repository).

Good luck and feel free to ask us any questions you may have.
