using System;
using System.Collections.Generic;


namespace Infrastructure.Persistence.Entities
{
    public class Review
    {
        public int ReviewID { get; set; }

        public int? ProductID { get; set; }  
        public int? UserID    { get; set; }  

        public int? Rating    { get; set; }  
        public string? Comment { get; set; }

        public string? ProductName { get; set; }
        public string? UserName    { get; set; }
        public Product? Product { get; set; }
        public User?    User    { get; set; }
    }
}

